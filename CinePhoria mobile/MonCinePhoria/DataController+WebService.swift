//
//	DataController+WebService.swift
//	MonCinePhoria
//
//  Cree par Bruno DELEBARRE-DEBAY on 29/11/2024.
//  bd2db
//


import Foundation

// Simuler une base de données locale
var reservationsDatabase: [String: [Reservation]] = [
    "admin": [
        Reservation.samplesReservation[0],
        Reservation.samplesReservation[1],
        Reservation.samplesReservation[2]
    ],
    "user@example.com": [
        Reservation.samplesReservation[1],
        Reservation.samplesReservation[2]
    ],
    
    "error@example.com": [
        Reservation.samplesReservation[1],
        Reservation.samplesReservation[2]
    ],
    "vide@example.com": [
    ]
    
]

extension DataController {
    
    /// Récupérer les réservations pour un email donné
    func fetchReservations(for email: String, completion: @escaping (Result<[Reservation], Error>) -> Void) {
        DispatchQueue.global().asyncAfter(deadline: .now() + 1.0) { // Simule un délai réseau
            if let reservations = reservationsDatabase[email] {
                completion(.success(reservations))
                self.isLoadingReservations = false
                
                // Sauvegarde des réservations récupérées en ligne
                self.saveReservationsToLocal()
            } else {
                self.loadReservationsFromLocal() // Charger les réservations locales
                completion(.failure(NSError(domain: "CinePhoria", code: 404, userInfo: [NSLocalizedDescriptionKey: "Aucune réservation trouvée pour l'utilisateur \(email)."])))
            }
        }
    }
    
}


