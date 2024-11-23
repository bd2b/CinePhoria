//
//	Film.swift
//	CinePhoriaTest
//
//  Cree par Bruno DELEBARRE-DEBAY on 23/11/2024.
//  bd2db
//


import Foundation
import SwiftUI

func fontActor(_ size: CGFloat) -> Font {
    Font.custom("Actor-Regular", size: size)
}


enum CategorySeeing: String, Codable {
    case TP = "TP"
    case moins12 = "-12"
    case moins16 = "-16"
    case moins18 = "-18"
}

struct ImageFilm {
    var image1024: ImageResource
    var image128: ImageResource
}

struct Film {
    var titleFilm: String
    var genre: String?
    var duration: String?
    var linkBO: URL?
    var categorySeeing: CategorySeeing = .TP
    var note: Double?
    var isCoupDeCoeur: Bool = false
    var filmDescription: String?
    var filmAuthor: String?
    var filmDistribution: String?
    
    var imageFilm: ImageFilm?
    
}

let filmsData = [
    Film(titleFilm: "A Fond", genre: "Action, Comedie", duration: "1h51", linkBO: URL(string: "https://www.youtube.com/watch?v=NDslM1QXcQg"), categorySeeing: .TP, note: 4.0, isCoupDeCoeur: true, filmDescription: """
Une famille embarque dans son monospace flambant neuf, au petit matin, afin d'éviter les embouteillages pour les vacances d’été. Tom, le père, enclenche son régulateur de vitesse électronique sur 130 km/h. Au moment où une dernière bourde de Ben, le beau-père, pousse Julia, excédée, à demander qu'on fasse demi-tour, Tom s'aperçoit qu'il ne contrôle plus son véhicule. L'électronique de bord ne répond plus, la vitesse est bloquée à 130 km/h. Toutes les manœuvres pour ralentir la voiture emballée restent sans effet. Une voiture folle, six passagers au bord de la crise de nerfs et un embouteillage monstre qui les attend à moins de deux cents kilomètres de là...
""", filmAuthor: "De Nicolas Benamou", filmDistribution: "Avec José Garcia, André Dussollier, Caroline Vigneaux", imageFilm: ImageFilm(image1024: ._15_1024 , image128: ._15_128))
    ]
