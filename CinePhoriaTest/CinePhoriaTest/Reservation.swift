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
    var film: Film
    var seance: Seance
    var evaluation: String?
    var note: Double?
    
    static var samplesReservation: [Reservation] {
        [
            Reservation(id: 1, film: Film.filmsSample[0], seance: Seance.samples[0]),
            Reservation(id: 2, film: Film.filmsSample[1], seance: Seance.samples[1]),
            Reservation(id: 3, film: Film.filmsSample[2], seance: Seance.samples[1],  evaluation: "Très bon film", note: 4.5),
            Reservation(id: 4, film: Film.filmsSample[2], seance: Seance.samples[1], evaluation: """
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam ullamcorper tincidunt justo id dignissim. Quisque vel erat sit amet augue suscipit cursus. Curabitur tempor elit tellus, nec consequat orci egestas eget. Aenean vitae maximus ex, ac blandit sem. Nulla mattis magna volutpat, rhoncus quam quis, egestas diam. Nunc sit amet fringilla erat, sit amet tincidunt ante. Pellentesque nec urna vestibulum, porta risus at, tempus risus. Aenean vel turpis tincidunt lacus aliquam hendrerit porta nec quam. Maecenas id nunc sollicitudin, mattis velit in, bibendum quam. Maecenas non elementum orci. Aliquam ut dolor erat. Cras quis hendrerit eros. Praesent condimentum magna nec ipsum auctor volutpat. 
""", note: 4.5)
        ]
    }
}
