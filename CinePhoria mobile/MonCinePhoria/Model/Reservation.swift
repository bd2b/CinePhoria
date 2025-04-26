//
//	Reservation.swift
//	MonCinePhoria
//
//  Cree par Bruno DELEBARRE-DEBAY on 24/11/2024.
//  bd2db
//


import Foundation
import SwiftUI

enum StateReservation: String, Codable, CaseIterable {
    case future = "future"// la reservation n'est pas passée, on doit présenter le QR Code
    case doneUnevaluated = "doneUnevaluated" // la réservation est passée mais il n'y a pas d'évaluation, on doit présenter la saisie d'une évaluation
    case doneEvaluated = "doneEvaluated" // la réservation est passée et il y a une évaluation, on affiche l'évaluation sans action
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

class Reservation: Identifiable, Codable, ObservableObject {
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
    @Published var evaluation: String?
    { didSet { isEvaluationMustBeReview = true }}
    @Published var note: Double?
    var isEvaluationMustBeReview: Bool // Trace si l'évaluation doit etre moderee
    
    
    var isPromoFriandise: Bool = false
    var numberSeatsRestingBeforPromoFriandise: Int?
    
    // Clés de codage pour les propriétés persistées
    enum CodingKeys: String, CodingKey {
        case id, film, seance, seats, numberPMR, evaluation, note, isEvaluationMustBeReview, isPromoFriandise, numberSeatsRestingBeforPromoFriandise
    }
    
    init(film: Film, seance: Seance, seats: [SeatsForTarif], numberPMR: Int, evaluation: String? = nil, note: Double? = nil) {
        self.film = film
        self.seance = seance
        self.seats = seats
        self.numberPMR = numberPMR
        self.evaluation = evaluation
        self.note = note
        self.isEvaluationMustBeReview = evaluation != nil
    }
    
    // MARK: - Conformité à Codable
        
        required init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            id = try container.decode(UUID.self, forKey: .id)
            film = try container.decode(Film.self, forKey: .film)
            seance = try container.decode(Seance.self, forKey: .seance)
            seats = try container.decode([SeatsForTarif].self, forKey: .seats)
            numberPMR = try container.decode(Int.self, forKey: .numberPMR)
            evaluation = try container.decodeIfPresent(String.self, forKey: .evaluation)
            note = try container.decodeIfPresent(Double.self, forKey: .note)
            isEvaluationMustBeReview = try container.decode(Bool.self, forKey: .isEvaluationMustBeReview)
            isPromoFriandise = try container.decode(Bool.self, forKey: .isPromoFriandise)
            numberSeatsRestingBeforPromoFriandise = try container.decodeIfPresent(Int.self, forKey: .numberSeatsRestingBeforPromoFriandise)
        }
        
        func encode(to encoder: Encoder) throws {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try container.encode(id, forKey: .id)
            try container.encode(film, forKey: .film)
            try container.encode(seance, forKey: .seance)
            try container.encode(seats, forKey: .seats)
            try container.encode(numberPMR, forKey: .numberPMR)
            try container.encode(evaluation, forKey: .evaluation)
            try container.encode(note, forKey: .note)
            try container.encode(isPromoFriandise, forKey: .isPromoFriandise)
            try container.encode(isEvaluationMustBeReview, forKey: .isEvaluationMustBeReview)
            try container.encodeIfPresent(numberSeatsRestingBeforPromoFriandise, forKey: .numberSeatsRestingBeforPromoFriandise)
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
