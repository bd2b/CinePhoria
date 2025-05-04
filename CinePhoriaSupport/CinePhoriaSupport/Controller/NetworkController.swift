//
//	NetworkController.swift
//	CinePhoriaSupport
//
//  Cree par Bruno DELEBARRE-DEBAY on 01/05/2025.
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

//let domainUrl = "http://127.0.0.1:3500/"
//let urlCinephoria = URL(string:"http://127.0.0.1:3500/")

func getVersion() {
    guard let url = URL(string: domainUrl + "/api/login/version") else {
        print("❌ URL invalide")
        return
    }

    let task = URLSession.shared.dataTask(with: url) { data, response, error in
        if let error = error {
            print("❌ Erreur de requête : \(error.localizedDescription)")
            return
        }

        guard let data = data,
              let string = String(data: data, encoding: .utf8) else {
            print("❌ Données invalides ou échec de décodage")
            return
        }

        print("📦 Numéro de version : \(string)")
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
        
        if debugTrace , let jsonString = String(data: request.httpBody ?? Data(), encoding: .utf8) {
            print("🔎 Requete JSON brute :\n\(jsonString)")
         }
        
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

// MARK: - Chargement des entités statiques

func fetchAllCinemas() async throws -> [CinemaDTO] {
    let url = "\(domainUrl)/api/cinemas"
    return try await apiRequest(endpoint: url, requiresAuth: false, debugTrace: true)
}

func fetchAllSalles() async throws -> [SalleDTO] {
    let url = "\(domainUrl)/api/salles"
    return try await apiRequest(endpoint: url, debugTrace: true)
}

func fetchAllEmployes() async throws -> [EmployeDTO] {
    let url = "\(domainUrl)/api/utilisateur/getemployes"
    return try await apiRequest(endpoint: url, debugTrace: true)
}

func fetchAllIncidents() async throws -> [IncidentDTO] {
    let url = "\(domainUrl)/api/incidents"
    return try await apiRequest(endpoint: url, debugTrace: true)
}

// MARK: Recherche utilisateur

func fetchUtilisateur(login: String) async throws -> [UtilisateurDTO] {
    let url = "\(domainUrl)/api/utilisateur/\(login)"
    return try await apiRequest(endpoint: url, requiresAuth: true, debugTrace: true)
}

// MARK: Sauvegarde incident
func syncIncident(_ incident: Incident) async throws -> Bool {
    if await incidentWasJustCreated(incident) {
        return try await createIncidentOnServer(incident)
    } else {
        return try await updateIncidentOnServer(incident)
    }
}


func incidentWasJustCreated(_ incident: Incident) async -> Bool {
    let url = "\(domainUrl)/api/incidents/\(incident.id)"
    do {
        let result: IncidentDTO = try await apiRequest(endpoint: url, requiresAuth: true, debugTrace: true)
    } catch {
        return true
    }
    return false
}

func createIncidentOnServer(_ incident: Incident) async throws -> Bool {
    print("📡 Création de l'incident : \(incident.title)")

    let url = "\(domainUrl)/api/incidents"
    let dto = IncidentDTO(from: incident)


    let json: [String: String] = try await apiRequest(
        endpoint: url,
        method: "POST",
        body: dto,
        requiresAuth: true,
        debugTrace: true
    )

    if let message = json["message"], !message.starts(with: "Erreur") {
        return true
    } else {
        print("❌ Erreur : \(json)")
        return false
    }
}

func updateIncidentOnServer(_ incident: Incident) async throws -> Bool {
    print("📡 Mise à jour de l'incident \(incident.title)")
    let url = "\(domainUrl)/api/incidents/\(incident.id)"
    let dto = IncidentDTO(from: incident)
    
    let json: [String: String] = try await apiRequest(
        endpoint: url,
        method: "PUT",
        body: dto,
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
