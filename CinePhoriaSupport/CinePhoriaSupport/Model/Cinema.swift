//
//	Cinema.swift
//	CinePhoriaSupport
//
//  Cree par Bruno DELEBARRE-DEBAY on 01/05/2025.
//  bd2db
//


import Foundation
import SwiftData

@Model
class Cinema {
    @Attribute(.unique) var nameCinema: String
    var adresse: String
    var ville: String
    var postalcode: String // ex: F-75010
    var emailCinema: String
    var telCinema: String
    var ligne1: String
    var ligne2: String
    
    
    var salles: [Salle] = []
    
    init(nameCinema: String, adresse: String, ville: String, postalcode: String,
         emailCinema: String, telCinema: String, ligne1: String, ligne2: String) {
        self.nameCinema = nameCinema
        self.adresse = adresse
        self.ville = ville
        self.postalcode = postalcode
        self.emailCinema = emailCinema
        self.telCinema = telCinema
        self.ligne1 = ligne1
        self.ligne2 = ligne2
    }
}

struct CinemaDTO: Codable {
    let nameCinema: String
    let adresse: String
    let ville: String
    let postalcode: String
    let emailCinema: String
    let telCinema: String
    let ligne1: String
    let ligne2: String
}

extension Cinema {
    convenience init(from dto: CinemaDTO) {
        self.init(
            nameCinema: dto.nameCinema,
            adresse: dto.adresse,
            ville: dto.ville,
            postalcode: dto.postalcode,
            emailCinema: dto.emailCinema,
            telCinema: dto.telCinema,
            ligne1: dto.ligne1,
            ligne2: dto.ligne2
        )
    }
}
