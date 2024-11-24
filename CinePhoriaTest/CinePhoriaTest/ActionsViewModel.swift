//
//	ActionsViewModel.swift
//	CinePhoriaTest
//
//  Cree par Bruno DELEBARRE-DEBAY on 24/11/2024.
//  bd2db
//


import Foundation

import SwiftUI

class ActionsViewModel: ObservableObject {
    @Published var stateReservation: StateReservation

    init(stateReservation: StateReservation) {
        self.stateReservation = stateReservation
    }

    // Fonction pour afficher le QR Code
    func showQRCode() {
        print("Afficher le QR Code pour la réservation future.")
        // Ajoutez ici la logique pour afficher le QR Code
    }

    // Fonction pour évaluer une réservation
    func evaluateReservation() {
        print("Évaluation de la réservation en cours.")
        // Ajoutez ici la logique pour gérer l'évaluation
    }
}
