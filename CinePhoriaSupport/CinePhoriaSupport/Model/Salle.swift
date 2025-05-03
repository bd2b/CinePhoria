//
//	Salle.swift
//	CinePhoriaSupport
//
//  Cree par Bruno DELEBARRE-DEBAY on 01/05/2025.
//  bd2db
//


import Foundation
import SwiftData

@Model
class Salle: Identifiable {
    @Attribute(.unique) var id: String
    var nameSalle: String
    var capacity: Int
    var numPMR: Int
    var rMax: Int
    var fMax: Int
    var seatsAbsents: String

    @Relationship var cinema: Cinema?
    @Relationship var incidents: [Incident]?

    init(id: String, nameSalle: String, capacity: Int, numPMR: Int, rMax: Int = 20, fMax: Int = 10, seatsAbsents: String = "") {
        self.id = id
        self.nameSalle = nameSalle
        self.capacity = capacity
        self.numPMR = numPMR
        self.rMax = rMax
        self.fMax = fMax
        self.seatsAbsents = seatsAbsents
    }
}

// MARK: - SalleDTO
struct SalleDTO: Codable {
    let id: String
    let nameSalle: String
    let capacity: Int
    let numPMR: Int
    let rMax: Int
    let fMax: Int
    let seatsAbsents: String
    
    // Pour le lien vers Cinema
    let nameCinema: String
}

extension Salle {
    convenience init(from dto: SalleDTO) {
        self.init(
            id: dto.id,
            nameSalle: dto.nameSalle,
            capacity: dto.capacity,
            numPMR: dto.numPMR,
            rMax: dto.rMax,
            fMax: dto.fMax,
            seatsAbsents: dto.seatsAbsents
        )
    }
}
