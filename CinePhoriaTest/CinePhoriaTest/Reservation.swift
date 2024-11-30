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

struct SeatsForTarif: Codable {
    var nameTarif: String
    var price: Double
    var numberSeats: Int
    
    static var samplesSeatsForTarif: [[SeatsForTarif]] {
        [
            [ SeatsForTarif(nameTarif: "Plein tarif", price: 10, numberSeats: 3)
            ],
            
            [ SeatsForTarif(nameTarif: "Plein tarif", price: 10, numberSeats: 4),
              SeatsForTarif(nameTarif: "Tarif réduit", price: 8, numberSeats: 1)],
            
            [ SeatsForTarif(nameTarif: "Plein tarif", price: 10, numberSeats: 3),
              SeatsForTarif(nameTarif: "Tarif Web", price: 9, numberSeats:2) ],
            
            [ SeatsForTarif(nameTarif: "Plein tarif", price: 10, numberSeats: 3),
              SeatsForTarif(nameTarif: "Tarif réduit", price: 8, numberSeats:3),
              SeatsForTarif(nameTarif: "Tarif Web", price: 89, numberSeats:1) ]
        ]
    }
    
}

class Reservation: Identifiable, Codable {
    var id = UUID()
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
    var film: Film
    var seance: Seance
    var seats: [SeatsForTarif]
    var numberPMR: Int
    var evaluation: String?
    var note: Double?
    
    var isPromoFriandise: Bool = false
    var numberSeatsRestingBeforPromoFriandise: Int?
    
    init(film: Film, seance: Seance, seats: [SeatsForTarif], numberPMR: Int, evaluation: String? = nil, note: Double? = nil) {
        self.film = film
        self.seance = seance
        self.seats = seats
        self.numberPMR = numberPMR
        self.evaluation = evaluation
        self.note = note
    }
    
    static var samplesReservation: [Reservation] {
        [
            Reservation( film: Film.filmsSample[0], seance: Seance.samples[0], seats: SeatsForTarif.samplesSeatsForTarif[0] , numberPMR: 1),
            Reservation( film: Film.filmsSample[1], seance: Seance.samples[1], seats: SeatsForTarif.samplesSeatsForTarif[1] , numberPMR: 1),
            Reservation( film: Film.filmsSample[2], seance: Seance.samples[1], seats: SeatsForTarif.samplesSeatsForTarif[0] , numberPMR: 0,  evaluation: "Très bon film", note: 4.5),
            Reservation( film: Film.filmsSample[2], seance: Seance.samples[1], seats: SeatsForTarif.samplesSeatsForTarif[3] , numberPMR: 1, evaluation: """
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam ullamcorper tincidunt justo id dignissim. Quisque vel erat sit amet augue suscipit cursus. Curabitur tempor elit tellus, nec consequat orci egestas eget. Aenean vitae maximus ex, ac blandit sem. Nulla mattis magna volutpat, rhoncus quam quis, egestas diam. Nunc sit amet fringilla erat, sit amet tincidunt ante. Pellentesque nec urna vestibulum, porta risus at, tempus risus. Aenean vel turpis tincidunt lacus aliquam hendrerit porta nec quam. Maecenas id nunc sollicitudin, mattis velit in, bibendum quam. Maecenas non elementum orci. Aliquam ut dolor erat. Cras quis hendrerit eros. Praesent condimentum magna nec ipsum auctor volutpat. 
""", note: 4.5)
        ]
    }
}
