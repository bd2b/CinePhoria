//
//    Reservation.swift
//    MonCinePhoria
//
//  Cree par Bruno DELEBARRE-DEBAY on 24/11/2024.
//  bd2db
//


import Foundation
import SwiftUI



struct SeatsForTarif: Codable {
    var numberSeats: Int
    var nameTarif: String
    var price: Double
}

enum ReservationState: String, Codable, CaseIterable  {
  case PendingChoiceSeance = "PendingChoiceSeance"    // Choix de seance en cours , le panel choix est affiché
  case PendingChoiceSeats = "PendingChoiceSeats"     // Choix de tarifs en cours, le panel reserve est affiché
  case ReserveCompteToConfirm = "ReserveCompteToConfirm"    // Une reservation a été enregistrée (film, seance, nombre de siege, nombre de prm, email communiqués)
  // avec un compte provisoire qu'il faut confirmer
  case ReserveMailToConfirm = "ReserveMailToConfirm"  // Le compte a été confirmé, il faut maintenant confirmer le mail en saisissant le code reçu dans la case modal
  case ReserveToConfirm = "ReserveToConfirm"          // Une reservation a été enregistrée (film, seance, nombre de siege, nombre de prm, email case communiqués)
  // avec un email qui est celui d'un compte existant
  case ReserveConfirmed = "ReserveConfirmed"           // La reservation est confirmé après login sur un compte existant, il y a assez de place (sieges et case PMR), et l'email est enregistré comme compte
  case DoneUnevaluated = "DoneUnevaluated"            // la réservation est passée mais il n'y a pas d'évaluation, on doit présenter la saisie d'une case évaluation
  case DoneEvaluated = "DoneEvaluated"                 // la réservation est passée et il y a une évaluation, on affiche l'évaluation sans action
  case ReserveCanceled = "ReserveCanceled"            // La reservation est annulée par l'utilisateur, les places et nombre de PMR ne sont pas comptés case dans la séance
  case ReserveDeleted = "ReserveDeleted"              // La reservation est supprimée par l'utilisateur, elle n'apparaitra plus dans son tableau

}

let decoder = JSONDecoder()

let formatter = DateFormatter()

class Reservation: Identifiable, Codable, ObservableObject , Comparable {
    static func < (lhs: Reservation, rhs: Reservation) -> Bool {
        return lhs.dateJour < rhs.dateJour
    }
    
    static func == (lhs: Reservation, rhs: Reservation) -> Bool {
        lhs.reservationId == rhs.reservationId
    }
    
    var utilisateurId: UUID
    var reservationId: UUID
    var stateReservation: ReservationState
    var timeStampCreate: Date
    var seatsReserved: String
    var displayName: String
    var dateJour: Date
    var titleFilm: String
    var nameCinema: String
    var isEvaluationMustBeReview: Bool
    var note: Double?
    var evaluation: String?
    var totalSeats: Int
    var totalPrice: Double
    var numberPMR: Int
    var filmId: UUID
    var seanceId: UUID
    var email: String
    var isPromoFriandise: Bool = false
    var numberSeatsRestingBeforPromoFriandise: Int?
    var imageFilm1024: String
    var imageFilm128: String
    var hourBeginHHSMM: String
    var hourEndHHSMM: String
    var nameSalle: String
    var qualite: String
    var bo: String
    var genreArray: String
    var categorySeeing: String
    var isCoupDeCoeur: Bool
    var noteFilm: Double
    var duration: String
    var filmAuthor: String
    var filmDescription: String
    var filmDistribution: String
    var filmPitch: String?
    var qrCodeData: [UInt8]?
    
    // Clés de codage pour les propriétés persistées
    enum CodingKeys: String, CodingKey {
  case utilisateurId, reservationId, stateReservation, timeStampCreate, seatsReserved, displayName,
    dateJour, titleFilm, nameCinema, isEvaluationMustBeReview, note, evaluation, totalSeats, totalPrice, numberPMR, filmId,
    seanceId, email, isPromoFriandise, numberSeatsRestingBeforPromoFriandise,
    imageFilm1024, imageFilm128, hourBeginHHSMM, hourEndHHSMM, nameSalle, qualite, bo, genreArray, categorySeeing, isCoupDeCoeur, noteFilm, duration, filmAuthor, filmDescription, filmDistribution, filmPitch, qrCodeData
    }
    
    init (
    utilisateurId: UUID,
    reservationId: UUID,
    stateReservation: ReservationState,
    timeStampCreate: Date,
    seatsReserved: String,
    displayName: String,
    dateJour: Date,
    titleFilm: String,
    nameCinema: String,
    isEvaluationMustBeReview: Bool,
    note: Double?,
    evaluation: String?,
    totalSeats: Int,
    totalPrice: Double,
    numberPMR: Int,
    filmId: UUID,
    seanceId: UUID,
    email: String,
    isPromoFriandise: Bool = false,
    numberSeatsRestingBeforPromoFriandise: Int?,
    imageFilm1024: String,
    imageFilm128: String,
    hourBeginHHSMM: String,
    hourEndHHSMM: String,
    nameSalle: String,
    qualite: String,
    bo: String,
    genreArray: String,
    categorySeeing: String,
    isCoupDeCoeur: Bool,
    noteFilm: Double,
    duration: String,
    filmAuthor: String,
    filmDescription: String,
    filmDistribution: String,
    filmPitch: String
    ) {
        
        self.utilisateurId = utilisateurId
        self.reservationId = reservationId
        self.stateReservation = stateReservation
        self.timeStampCreate = timeStampCreate
        self.seatsReserved = seatsReserved
        self.displayName = displayName
        self.dateJour = dateJour
        self.titleFilm = titleFilm
        self.nameCinema = nameCinema
        self.isEvaluationMustBeReview = isEvaluationMustBeReview
        self.note = note
        self.evaluation = evaluation
        self.totalSeats = totalSeats
        self.totalPrice = totalPrice
        self.numberPMR = numberPMR
        self.filmId = filmId
        self.seanceId = seanceId
        self.email = email
        self.isPromoFriandise = isPromoFriandise
        self.numberSeatsRestingBeforPromoFriandise = numberSeatsRestingBeforPromoFriandise
        self.imageFilm1024 = imageFilm1024
        self.imageFilm128 = imageFilm128
        self.hourBeginHHSMM = hourBeginHHSMM
        self.hourEndHHSMM = hourEndHHSMM
        self.nameSalle = nameSalle
        self.qualite = qualite
        self.bo = bo
        self.genreArray = genreArray
        self.categorySeeing = categorySeeing
        self.isCoupDeCoeur = isCoupDeCoeur
        self.noteFilm = noteFilm
        self.duration = duration
        self.filmAuthor = filmAuthor
        self.filmDescription = filmDescription
        self.filmDistribution = filmDistribution
        self.filmPitch = filmPitch
    }
    
    // MARK: - Conformité à Codable
        
        required init(from decoder: Decoder) throws {
            
            
            let container = try decoder.container(keyedBy: CodingKeys.self)
            
            utilisateurId = try container.decode(UUID.self, forKey: .utilisateurId)
            reservationId = try container.decode(UUID.self, forKey: .reservationId)
            stateReservation = try container.decode(ReservationState.self, forKey: .stateReservation)
            timeStampCreate = try container.decodeIfPresent(Date.self, forKey: .timeStampCreate) ?? Date()
            seatsReserved = try container.decode(String.self, forKey: .seatsReserved)
            displayName = try container.decode(String.self, forKey: .displayName)
            dateJour = try container.decode(Date.self, forKey: .dateJour)
            titleFilm = try container.decode(String.self, forKey: .titleFilm)
            nameCinema = try container.decode(String.self, forKey: .nameCinema)
            
            isEvaluationMustBeReview = try container.decodeBoolFromInt(forKey: .isEvaluationMustBeReview)
            
            // isEvaluationMustBeReview = try container.decode(Bool.self, forKey: .isEvaluationMustBeReview)
            note = try container.decodeIfPresent(Double.self, forKey: .note)
            evaluation = try container.decodeIfPresent(String.self, forKey: .evaluation)
            if let intSeats = try? container.decode(Int.self, forKey: .totalSeats) {
                totalSeats = intSeats
            } else if let strSeats = try? container.decode(String.self, forKey: .totalSeats),
                      let intFromStr = Int(strSeats) {
                totalSeats = intFromStr
            } else {
                totalSeats = 0
            }
            totalPrice = try container.decode(Double.self, forKey: .totalPrice)
            numberPMR = try container.decode(Int.self, forKey: .numberPMR)
            filmId = try container.decode(UUID.self, forKey: .filmId)
            seanceId = try container.decode(UUID.self, forKey: .seanceId)
            email = try container.decode(String.self, forKey: .email)
            
            
            // isPromoFriandise = try container.decode(Bool.self, forKey: .isPromoFriandise)
            isPromoFriandise = try container.decodeBoolFromInt(forKey: .isPromoFriandise)
            
            
            numberSeatsRestingBeforPromoFriandise = try container.decode(Int.self, forKey: .numberSeatsRestingBeforPromoFriandise)
            imageFilm1024 = try container.decode(String.self, forKey: .imageFilm1024)
            imageFilm128 = try container.decode(String.self, forKey: .imageFilm128)
            hourBeginHHSMM = try container.decode(String.self, forKey: .hourBeginHHSMM)
            hourEndHHSMM = try container.decode(String.self, forKey: .hourEndHHSMM)
            nameSalle = try container.decode(String.self, forKey: .nameSalle)
            qualite = try container.decode(String.self, forKey: .qualite)
            bo = try container.decode(String.self, forKey: .bo)
            genreArray = try container.decode(String.self, forKey: .genreArray)
            categorySeeing = try container.decode(String.self, forKey: .categorySeeing)
            
            // isCoupDeCoeur = try container.decode(Bool.self, forKey: .isCoupDeCoeur)
            isCoupDeCoeur = try container.decodeBoolFromInt(forKey: .isCoupDeCoeur)
            
            
            noteFilm = try container.decode(Double.self, forKey: .noteFilm)
            duration = try container.decode(String.self, forKey: .duration)
            filmAuthor = try container.decode(String.self, forKey: .filmAuthor)
            filmDescription = try container.decode(String.self, forKey: .filmDescription)
            filmDistribution = try container.decode(String.self, forKey: .filmDistribution)
            filmPitch = try container.decode(String.self, forKey: .filmPitch)
            qrCodeData = try container.decodeIfPresent([UInt8].self, forKey: .qrCodeData)
            
        }
        
        func encode(to encoder: Encoder) throws {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try container.encode(utilisateurId, forKey: .utilisateurId)
            try container.encode(reservationId, forKey: .reservationId)
            try container.encode(stateReservation, forKey: .stateReservation)
            try container.encode(timeStampCreate, forKey: .timeStampCreate)
            try container.encode(seatsReserved, forKey: .seatsReserved)
            try container.encode(displayName, forKey: .displayName)
            try container.encode(dateJour, forKey: .dateJour)
            try container.encode(titleFilm, forKey: .titleFilm)
            try container.encode(nameCinema, forKey: .nameCinema)
            try container.encode(isEvaluationMustBeReview ? 1 : 0, forKey: .isEvaluationMustBeReview)
            try container.encode(note, forKey: .note)
            try container.encode(evaluation, forKey: .evaluation)
            try container.encode(totalSeats, forKey: .totalSeats)
            try container.encode(totalPrice, forKey: .totalPrice)
            try container.encode(numberPMR, forKey: .numberPMR)
            try container.encode(filmId, forKey: .filmId)
            try container.encode(seanceId, forKey: .seanceId)
            try container.encode(email, forKey: .email)
            try container.encode(isPromoFriandise ? 1 : 0, forKey: .isPromoFriandise)
            try container.encode(numberSeatsRestingBeforPromoFriandise, forKey: .numberSeatsRestingBeforPromoFriandise)
            
            try container.encode(imageFilm1024, forKey: .imageFilm1024)
            try container.encode(imageFilm128, forKey: .imageFilm128)
            try container.encode(hourBeginHHSMM, forKey: .hourBeginHHSMM)
            try container.encode(hourEndHHSMM, forKey: .hourEndHHSMM)
            try container.encode(nameSalle, forKey: .nameSalle)
            try container.encode(qualite, forKey: .qualite)
            try container.encode(bo, forKey: .bo)
            try container.encode(genreArray, forKey: .genreArray)
            try container.encode(categorySeeing, forKey: .categorySeeing)
            try container.encode(isCoupDeCoeur ? 1 : 0, forKey: .isCoupDeCoeur)
            try container.encode(noteFilm, forKey: .noteFilm)
            try container.encode(duration, forKey: .duration)
            try container.encode(filmAuthor, forKey: .filmAuthor)
            try container.encode(filmDescription, forKey: .filmDescription)
            try container.encode(filmDistribution, forKey: .filmDistribution)
            try container.encode(filmPitch, forKey: .filmPitch)
            try container.encode(qrCodeData, forKey: .qrCodeData)
            
        }
}

extension KeyedDecodingContainer {
    func decodeBoolFromInt(forKey key: K) throws -> Bool {
        let intValue = try self.decode(Int.self, forKey: key)
        return intValue != 0
    }
}
