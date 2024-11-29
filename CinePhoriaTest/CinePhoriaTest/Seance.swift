//
//	Seance.swift
//	CinePhoriaTest
//
//  Cree par Bruno DELEBARRE-DEBAY on 24/11/2024.
//  bd2db
//


import Foundation
import SwiftUI

let fontSeance = "DS-DIGI"
let helper = DateFormatterHelper.shared

enum QualityFilm: String, Codable {
    case troisD = "3D"
    case quatreK = "4K"
    case quatreDX = "4DX"
    case standard = "movieclapper"
    
    func image() -> Image {
        switch self {
        case .standard:
            return Image(systemName: self.rawValue) // SF Symbol
        case .troisD, .quatreK, .quatreDX:
            return Image(self.rawValue) // Image from Assets
            }
        }
}

enum BO : String, Codable {
    case vf = "VF"
    case vo = "VO"
}

struct Seance: Codable {
    var hourBegin: String
    var hourEnd: String
    var date: Date
    var location: String
    var qualite: QualityFilm
    var bo: BO
    
    static var sampleDateBegin: Date {
        let calendar = Calendar.current
        var dateComponents = DateComponents()
        dateComponents.year = 2024
        dateComponents.month = 11
        dateComponents.day = 23
        dateComponents.hour = 14
        dateComponents.minute = 50
        
        if let specificDate = calendar.date(from: dateComponents) {
            return specificDate
        } else {
            return .now
        }
        
    }
    static var sampleDateBeginFutur: Date {
        let calendar = Calendar.current
        var dateComponents = DateComponents()
        dateComponents.year = 2025
        dateComponents.month = 11
        dateComponents.day = 23
        dateComponents.hour = 14
        dateComponents.minute = 50
        
        if let specificDate = calendar.date(from: dateComponents) {
            return specificDate
        } else {
            return .now
        }
        
    }
    static var samples: [Seance] {
        [
            Seance(hourBegin: helper.hourString(from: sampleDateBegin), hourEnd: "16:00", date: sampleDateBegin, location: "Salle 1", qualite: .troisD, bo: .vf),
            Seance(hourBegin: helper.hourString(from: sampleDateBeginFutur), hourEnd: "16:00", date: sampleDateBeginFutur, location: "Salle 1", qualite: .troisD, bo: .vf)
        ]
    }
}






