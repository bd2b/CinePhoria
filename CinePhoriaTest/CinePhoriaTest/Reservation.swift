//
//	Reservation.swift
//	CinePhoriaTest
//
//  Cree par Bruno DELEBARRE-DEBAY on 24/11/2024.
//  bd2db
//


import Foundation
import SwiftUI

enum StateReservation: String, Codable, CaseIterable {
    case future // la reservation n'est pas passée, on doit présenter le QR Code
    case doneUnevaluated // la réservation est passée mais il n'y a pas d'évaluation, on doit présenter la saisie d'une évaluation
    case doneEvaluated // la réservation est passée et il y a une évaluation, on affiche l'évaluation sans action
}



struct Reservation: Identifiable {
    var id: Int
    var stateReservation: StateReservation {
        let now = Date.now
        if seance.date < now {
                return .future
        } else if evaluation == nil {
                return .doneUnevaluated
            } else {
                return .doneEvaluated
            }
        }
    var seance: Seance
    var evaluation: String?
    var note: Double?
    
}
