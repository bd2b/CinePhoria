
//
//    ControllerNetwork.swift
//    MonCinePhoria
//
//  Cree par Bruno DELEBARRE-DEBAY on 29/04/2025.
//  bd2db
//

import Foundation
import SwiftUI

struct AnyEncodable: Encodable {
    private let encodeFunc: (Encoder) throws -> Void

    init<T: Encodable>(_ wrapped: T) {
        self.encodeFunc = wrapped.encode
    }

    func encode(to encoder: Encoder) throws {
        try encodeFunc(encoder)
    }
}

let domainUrl = "https://cinephoria.bd2db.com"
let urlCinephoria = URL(string:"https://cinephoria.bd2db.com")

func getVersion() {
    let urlVersion = URL(string: domainUrl + "/api/login/version")
    let task = URLSession .shared.dataTask(with: urlVersion!) { (data, response, error) in
        if let data = data,
            let string = String(data: data, encoding: .utf8) {
                print("Numero de version :\(string)")
            }
        }
    task.resume()
    
    }

struct LoginResponse: Decodable {
    let accessToken: String
}

enum LoginError: Error {
    case serverError(String)
    case invalidResponse
}

func loginApi(compte: String, password: String) async throws  {
    guard let url = URL(string: "\(domainUrl)/api/login") else {
        throw LoginError.invalidResponse
    }

    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.addValue("application/json", forHTTPHeaderField: "Content-Type")
    request.httpShouldHandleCookies = true

    let body = ["compte": compte, "password": password]
    request.httpBody = try JSONEncoder().encode(body)

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let httpResponse = response as? HTTPURLResponse else {
        throw LoginError.invalidResponse
    }

    if httpResponse.statusCode != 200 {
        if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
           let message = json["message"] as? String {
            throw LoginError.serverError(message)
        } else {
            throw LoginError.serverError("Erreur inconnue")
        }
    }

    let decoded = try JSONDecoder().decode(LoginResponse.self, from: data)
    UserDefaults.standard.set(decoded.accessToken, forKey: "jwtAccessToken")
    print("Login OK, accessToken stocké.")
}

enum ApiError: Error {
    case invalidResponse
    case authenticationRequired
    case tokenRefreshFailed
    case serverError(String)
}

func refreshAccessToken() async throws {
    guard let url = URL(string: "\(domainUrl)/api/refresh") else {
        throw ApiError.invalidResponse
    }
    
    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.httpShouldHandleCookies = true
    
    let (data, response) = try await URLSession.shared.data(for: request)
    
    guard let httpResponse = response as? HTTPURLResponse else {
        throw ApiError.invalidResponse
    }
    
    if !httpResponse.isSuccessful {
        UserDefaults.standard.removeObject(forKey: "jwtAccessToken")
        throw ApiError.tokenRefreshFailed
    }
    
    let json = try JSONSerialization.jsonObject(with: data) as? [String: Any]
    if let accessToken = json?["accessToken"] as? String {
        UserDefaults.standard.set(accessToken, forKey: "jwtAccessToken")
        print("Nouveau accessToken obtenu via /api/refresh")
    } else {
        throw ApiError.tokenRefreshFailed
    }
}

extension HTTPURLResponse {
    var isSuccessful: Bool {
        return (200...299).contains(self.statusCode)
    }
}

func apiRequest<T: Decodable>(
    endpoint: String,
    method: String = "GET",
    body: Encodable? = nil,
    requiresAuth: Bool = true,
    debugTrace: Bool = false
) async throws -> T {
    var token = UserDefaults.standard.string(forKey: "jwtAccessToken")
    
    if requiresAuth && token == nil {
        throw ApiError.authenticationRequired
    }
    
    guard let url = URL(string: endpoint) else {
        throw ApiError.invalidResponse
    }
    
    var request = URLRequest(url: url)
    request.httpMethod = method
    request.httpShouldHandleCookies = true

    if let body = body {
        request.httpBody = try JSONEncoder().encode(AnyEncodable(body))
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
    }
    
    if requiresAuth, let token = token {
        request.addValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    }
    
    var (data, response) = try await URLSession.shared.data(for: request)
    
    if debugTrace, let jsonString = String(data: data, encoding: .utf8) {
       print("🔎 Réponse JSON brute :\n\(jsonString)")
    }
    
    guard let httpResponse = response as? HTTPURLResponse else {
        throw ApiError.invalidResponse
    }
    
    if requiresAuth && (httpResponse.statusCode == 401 || httpResponse.statusCode == 403) {
        print("🔄 Token expiré, tentative de refresh...")
        
        try await refreshAccessToken()
        
        token = UserDefaults.standard.string(forKey: "jwtAccessToken")
        
        guard let token = token else {
            throw ApiError.tokenRefreshFailed
        }
        
        // Refaire la requête avec nouveau token
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        (data, response) = try await URLSession.shared.data(for: request)
    }
    
    guard let finalHttpResponse = response as? HTTPURLResponse else {
        throw ApiError.invalidResponse
    }
    
    if !finalHttpResponse.isSuccessful {
        
        let errorJson = try JSONSerialization.jsonObject(with: data) as? [String: Any]
        let message = errorJson?["message"] as? String ?? "Erreur inconnue"
        throw ApiError.serverError(message)
    }
    
    let decoder = JSONDecoder()
    let formatter = DateFormatter()
    formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSXXXXX"
    formatter.locale = Locale(identifier: "en_US_POSIX")
    formatter.timeZone = TimeZone(secondsFromGMT: 0)
    decoder.dateDecodingStrategy = .formatted(formatter)
    
    let decodedData = try decoder.decode(T.self, from: data)
    return decodedData
}

func getReservationForUtilisateur(email: String) async throws -> [Reservation] {
    let endpoint = "\(domainUrl)/api/reservation/mobile/\(email)"
    let reservations: [Reservation] = try await apiRequest(
        endpoint: endpoint,
        method: "GET",
        requiresAuth: true
    )
    return reservations
}



// Récupération de l'image et stockage en fichier à la volée
func getImageFilm(value: String, saveAs filename: String? = nil) -> some View {
    let prefixAPI = "\(domainUrl)/api/films/affichefile/"
    let prefixDist = "\(domainUrl)/assets/static/"
    
    let uuidCharset = CharacterSet(charactersIn: "0123456789abcdef")
    let prefixLength = min(value.count, 36)
    let prefix = String(value.prefix(prefixLength))
    let isUUIDLike = prefix.count == 36 && prefix.unicodeScalars.allSatisfy { uuidCharset.contains($0) }
    let stringURL = (isUUIDLike ? prefixAPI : prefixDist) + value

    guard let url = URL(string: stringURL) else {
        return AnyView(
            Image(systemName: "photo")
                .resizable()
                .aspectRatio(contentMode: .fit)
                .foregroundColor(.gray)
        )
    }
    print("Acces à l'image par le reseau : ", url.absoluteString)
    return AnyView(
        AsyncImage(url: url) { phase in
            
            switch phase {
            case .success(let image):
                image
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .onAppear {
                        if let filename = filename,
                           let dir = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first {
                            let fileURL = dir.appendingPathComponent(filename)
                            if !FileManager.default.fileExists(atPath: fileURL.path) {
                                Task {
                                    await saveImageFrom(url: url, named: filename)
                                }
                            }
                        }
                    }

            case .failure:
                Image(systemName: "xmark.octagon")
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .foregroundColor(.red)

            case .empty:
                ProgressView()
            @unknown default:
                EmptyView()
            }
        }
    )
}


struct QRCodeResponse: Decodable {
    let qrCodeFile: [UInt8]
    let contentType: String
}

func getReservationQRCodeImage(reservationId: UUID) async throws -> UIImage {
    // les uuid sont en minuscule
    let resaIdMin = reservationId.uuidString.lowercased()
    let endpoint = "\(domainUrl)/api/reservation/qrcodeimage/\(resaIdMin)"
    
    let qrData: QRCodeResponse = try await apiRequest(
        endpoint: endpoint,
        method: "GET",
        requiresAuth: true
    )
    let byteArray = Data(qrData.qrCodeFile)
    
    guard let image = UIImage(data: byteArray) else {
        throw ApiError.invalidResponse
    }

    return image
}

func getSeatsForReservation(reservationId: String) async throws -> [SeatsForReservation] {
    let endpoint = "\(domainUrl)/api/reservation/seats/id/\(reservationId)"
    let seatsForReservation: [SeatsForReservation] = try await apiRequest(
        endpoint: endpoint,
        method: "GET",
        requiresAuth: true
    )
    return seatsForReservation
}

func setStateReservation(
    reservationId: String,
    stateReservation: ReservationState
) async throws -> Bool {
    let endpoint = "\(domainUrl)/api/reservation/setstate"
    let json: [String: String] = try await apiRequest(
        endpoint: endpoint,
        method: "POST",
        body: ["reservationId": reservationId, "stateReservation": stateReservation.rawValue],
        requiresAuth: true,
        debugTrace: true
    )

    if let message = json["message"], !message.starts(with: "Erreur") {
        return true
    } else {
        print("Erreur : \(json)")
        return false
    }
}


func setEvaluationReservation(
    reservationId: String,
    note: Double,
    evaluation: String,
    isEvaluationMustBeReview: Bool
) async throws -> Bool {
        let isEvaluationMustBeReviewStr = isEvaluationMustBeReview ? "true" : "false"
        let noteRounded = Double(String(format: "%.1f", note)) ?? note
        let endpoint = "\(domainUrl)/api/reservation/setevaluation"
        let json: [String: String ] = try await apiRequest(
            endpoint: endpoint,
            method: "POST",
            body: [
                    "reservationId": AnyEncodable(reservationId),
                    "note": AnyEncodable(noteRounded),
                    "evaluation": AnyEncodable(evaluation),
                    "isEvaluationMustBeReview": AnyEncodable(isEvaluationMustBeReviewStr)
            ],
            requiresAuth: true,
            debugTrace: true
            )
    if let message = json["message"], !message.starts(with: "Erreur") {
        return true
    } else {
        print("Erreur : \(json)")
        return false
    }
    }



  
func loadOrFetchImage(for reservation: Reservation, userEmail: String, type: String = "1024") -> some View {
    let filename = type == "1024" ? reservation.imageFilm1024 : reservation.imageFilm128
    let fileManager = FileManager.default
    if let dir = fileManager.urls(for: .documentDirectory, in: .userDomainMask).first {
        let userDir = dir.appendingPathComponent(userEmail)
        let path = userDir.appendingPathComponent(filename)
        if fileManager.fileExists(atPath: path.path),
           let uiImage = UIImage(contentsOfFile: path.path) {
            print("Utilisation du cache disque pour l'image \(filename)");
            return AnyView(
                Image(uiImage: uiImage)
                    .resizable()
                    .aspectRatio(contentMode: .fit)
            )
        } else {
            print("Récupération de l'image \(filename)");
            // ensure directory exists
            try? fileManager.createDirectory(at: userDir, withIntermediateDirectories: true)
            
            let rawView = getImageFilm(value: filename, saveAs: "\(userEmail)/\(filename)")
            return AnyView(rawView)
        }
    }
    return AnyView(
        Image(systemName: "photo")
            .resizable()
            .aspectRatio(contentMode: .fit)
            .foregroundColor(.gray)
    )
}

// On a besoin de la fonction de sauvegarde des reservations
extension DataController {
    func loadOrFetchQRCode(for index: Int) async -> UIImage? {
        guard index >= 0 && index < reservations.count else { return nil }
        let reservation = reservations[index]
        
        if let cachedData = reservation.qrCodeData,
           let image = UIImage(data: Data(cachedData)) {
            print("Recupération du qrCode via reservation")
            return image
        } else {
            do {
                print("Recupération du qrCode via le serveur")
                let image = try await getReservationQRCodeImage(reservationId: reservation.reservationId)
                if let data = image.pngData() {
                    reservations[index].qrCodeData = [UInt8](data)
                    saveReservationsToLocal()
                }
                return image
            } catch {
                print("Erreur chargement QRCode pour \(reservation.reservationId): \(error)")
                return nil
            }
        }
    }
    
    func loadOrFetchSeatsForReservation(for index: Int) async -> [SeatsForReservation]? {
        guard index >= 0 && index < reservations.count else { return nil }
        let reservation = reservations[index]
        
        if let seatsForReservation = reservation.seatsForReservation {
            print("Recupération des SeatsForReservation via reservation")
            return seatsForReservation
        } else {
            do {
                print("Recupération des SeatsForReservation via serveur")
                let seatsForReservation = try await getSeatsForReservation(reservationId: reservation.reservationId.uuidString)
                reservations[index].seatsForReservation = seatsForReservation
                saveReservationsToLocal()
                
                return seatsForReservation
            } catch {
                print("Erreur chargement seatsForReservation pour \(reservation.reservationId): \(error)")
                return nil
            }
        }
    }
}
