//
//	Seance.swift
//	MonCinePhoria
//
//  Cree par Bruno DELEBARRE-DEBAY on 24/11/2024.
//  bd2db
//


import Foundation
import SwiftUI

let fontSeance = "DS-DIGI"
let helper = DateFormatterHelper.shared






enum QualityFilm: String, Codable {
    case troisD =   "3D"
    case quatreK =  "4K"
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

//export class SeanceSeule {
//    id!: string;
//    filmId?: string;
//    salleId?: string;
//    dateJour?: string;
//    hourBeginHHSMM?: string;
//    hourEndHHSMM?: string;
//    qualite?: string;
//    bo?: string;
//    numFreeSeats?: string;
//    numFreePMR?: string;
//    alertAvailibility?: string;
//    
//  
//   constructor(data: Partial<SeanceSeule>) {
//      Object.assign(this, data);
//    }
//  };

//struct SeanceSeule: Codable, Identifiable {
//    var id: UUID
//    var filmId: UUID
//    var salleId: UUID
//    var dateJour: Date
//    var hourBeginHHSMM: String
//    var hourEndHHSMM: String
//    var qualite: QualityFilm
//    var bo: BO
//    var numFreeSeats: String
//    var numFreePMR: String
//    
//}





//typealias Salle = String
//
//struct Seance: Codable {
//    var id: UUID = UUID()
//    var hourBeginHHSMM: String
//    var hourEndHHSMM: String
//    var date: Date
//    var location: Salle
//    var qualite: QualityFilm
//    var bo: BO
//    
//    static var sampleDateBegin: Date {
//        let calendar = Calendar.current
//        var dateComponents = DateComponents()
//        dateComponents.year = 2024
//        dateComponents.month = 11
//        dateComponents.day = 23
//        dateComponents.hour = 14
//        dateComponents.minute = 50
//        
//        if let specificDate = calendar.date(from: dateComponents) {
//            return specificDate
//        } else {
//            return .now
//        }
//        
//    }
//    static var sampleDateBeginFutur: Date {
//        let calendar = Calendar.current
//        var dateComponents = DateComponents()
//        dateComponents.year = 2025
//        dateComponents.month = 11
//        dateComponents.day = 23
//        dateComponents.hour = 14
//        dateComponents.minute = 50
//        
//        if let specificDate = calendar.date(from: dateComponents) {
//            return specificDate
//        } else {
//            return .now
//        }
//        
//    }
//    static var samples: [Seance] {
//        [
//            Seance(hourBeginHHSMM: helper.hourString(from: sampleDateBegin), hourEndHHSMM: "16:00", date: sampleDateBegin, location: "Salle 1", qualite: .troisD, bo: .vf),
//            Seance(hourBeginHHSMM: helper.hourString(from: sampleDateBeginFutur), hourEndHHSMM: "16:00", date: sampleDateBeginFutur, location: "Salle 1", qualite: .troisD, bo: .vf)
//        ]
//    }
//}






