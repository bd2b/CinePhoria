//
//	Incident.swift
//	CinePhoriaSupport
//
//  Cree par Bruno DELEBARRE-DEBAY on 01/05/2025.
//  bd2db
//


import Foundation
import SwiftData
@Model
class Incident {
    @Attribute(.unique) var id: Int
    var status: String
    var title: String
    var descriptionIncident: String
    var dateOpen: Date
    var dateClose: Date?

    var salle: Salle?        // PAS d’inverse défini ici
    var employe: Employe?

    init(id: Int, status: String, title: String, description: String,
         dateOpen: Date, dateClose: Date? = nil) {
        self.id = id
        self.status = status
        self.title = title
        self.descriptionIncident = description
        self.dateOpen = dateOpen
        self.dateClose = dateClose
    }

    var isOpen: Bool { dateClose == nil }
}
