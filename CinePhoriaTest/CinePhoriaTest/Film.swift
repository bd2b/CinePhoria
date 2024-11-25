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

struct ImageFilm: Hashable {
    var id: UUID = UUID()
    var image1024: ImageResource
    var image128: ImageResource
}

struct Film : Identifiable, Hashable {
    static func == (lhs: Film, rhs: Film) -> Bool {
        lhs.id == rhs.id
    }
    
    
    var id: UUID = UUID()
    
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
    
    static var filmsSample: [Film] = filmsData
    
}

let filmsData = [
    Film(titleFilm: "A Fond", genre: "Action, Comedie", duration: "1h51", linkBO: URL(string: "https://www.youtube.com/watch?v=NDslM1QXcQg"), categorySeeing: .TP, note: 4.0, isCoupDeCoeur: true, filmDescription: """
Une famille embarque dans son monospace flambant neuf, au petit matin, afin d'éviter les embouteillages pour les vacances d’été. Tom, le père, enclenche son régulateur de vitesse électronique sur 130 km/h. Au moment où une dernière bourde de Ben, le beau-père, pousse Julia, excédée, à demander qu'on fasse demi-tour, Tom s'aperçoit qu'il ne contrôle plus son véhicule. L'électronique de bord ne répond plus, la vitesse est bloquée à 130 km/h. Toutes les manœuvres pour ralentir la voiture emballée restent sans effet. Une voiture folle, six passagers au bord de la crise de nerfs et un embouteillage monstre qui les attend à moins de deux cents kilomètres de là...
""", filmAuthor: "De Nicolas Benamou", filmDistribution: "Avec José Garcia, André Dussollier, Caroline Vigneaux", imageFilm: ImageFilm(image1024: ._15_1024 , image128: ._15_128)),
    
    Film(titleFilm: "Joker", genre: "Action, Drame, Romance", duration: "2h19", linkBO: URL(string: "https://www.youtube.com/watch?v=OoTx1cYC5u8"), categorySeeing: .moins16, note: 2.0, isCoupDeCoeur: false, filmDescription: """
A quelques jours de son procès pour les crimes commis sous les traits du Joker, Arthur Fleck rencontre le grand amour et se trouve entraîné dans une folie à deux.
""", filmAuthor: "De Todd Phillips", filmDistribution: "Avec Joaquin Phoenix, Lady Gaga, Brendan Gleeson ", imageFilm: ImageFilm(image1024: ._2_1024 , image128: ._2_128)) ,
    
    Film(titleFilm: "Le Dernier Métro", genre: "Drame, Romance, Guerre", duration: "2h13", linkBO: URL(string: "https://www.youtube.com/watch?v=hXCUifFwGzc"), categorySeeing: .moins12, note: 5.0, isCoupDeCoeur: true, filmDescription: """
Paris, septembre 1942. Lucas Steiner, le directeur du théâtre Montmartre a dû fuir parce qu’il est juif. Sa femme Marion Steiner dirige le théâtre et engage Bernard Granger, transfuge du Grand Guignol, pour jouer à ses côtés dans « la Disparue », que met en scène Jean-Louis Cottins. Jusqu’au soir de la générale, la troupe subit les menaces du virulent critique de « Je suis partout », Daxiat, dont l’ambition est de diriger la Comédie-Française. Et si, par amour pour sa femme, Lucas Steiner avait fait semblant de fuir la France et était resté caché dans la cave de son théâtre pendant toute la guerre….
""", filmAuthor: "De François Truffaut", filmDistribution: "Avec Catherine Deneuve, Gérard Depardieu, Jean Poiret", imageFilm: ImageFilm(image1024: ._14_1024 , image128: ._14_128))
    
    ]
