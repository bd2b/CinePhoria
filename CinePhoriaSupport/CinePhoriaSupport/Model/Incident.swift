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
class Incident: Identifiable {
    @Attribute(.unique) var id: Int
    var salleId: String
    var matricule: String
    var status: String
    var title: String
    var descriptionIncident: String
    var dateOpen: Date
    var dateClose: Date?
    
    @Relationship var salle: Salle?
    @Relationship var employe: Employe?

    init(
        id: Int,
        salleId: String,
        matricule: String,
        status: String,
        title: String,
        descriptionIncident: String,
        dateOpen: Date,
        dateClose: Date? = nil
    ) {
        self.id = id
        self.salleId = salleId
        self.matricule = matricule
        self.status = status
        self.title = title
        self.descriptionIncident = descriptionIncident
        self.dateOpen = dateOpen
        self.dateClose = dateClose
    }
}

struct IncidentDTO: Codable {
    var id: Int
    var salleId: String
    var matricule: String
    var status: String
    var title: String
    var descriptionIncident: String
    var dateOpen: Date
    var dateClose: Date?

    enum CodingKeys: String, CodingKey {
        case id
        case salleId = "Salleid"
        case matricule
        case status
        case title
        case descriptionIncident = "description"
        case dateOpen
        case dateClose
    }

    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)

        id = try container.decode(Int.self, forKey: .id)
        salleId = try container.decode(String.self, forKey: .salleId)
        matricule = String(try container.decode(Int.self, forKey: .matricule))
        status = try container.decode(String.self, forKey: .status)
        title = try container.decode(String.self, forKey: .title)
        descriptionIncident = try container.decode(String.self, forKey: .descriptionIncident)
        let dateFormatter = ISO8601DateFormatter()
        let dateOpenStr = try container.decode(String.self, forKey: .dateOpen)
        if let dateF = dateFormatter.date(from: dateOpenStr) {
            self.dateOpen = dateF
        } else {
            self.dateOpen = .now
        }
        
        if let dateCloseStr = try? container.decodeIfPresent(String.self, forKey: .dateClose) {
            dateClose = dateFormatter.date(from: dateCloseStr )
        }
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)

        try container.encode(id, forKey: .id)
        try container.encodeIfPresent(salleId, forKey: .salleId)
        try container.encodeIfPresent(matricule, forKey: .matricule)
        try container.encodeIfPresent(status, forKey: .status)
        try container.encodeIfPresent(title, forKey: .title)
        try container.encodeIfPresent(descriptionIncident, forKey: .descriptionIncident)

        let formatter = ISO8601DateFormatter()
       
            try container.encode(formatter.string(from: dateOpen), forKey: .dateOpen)
        
        if let dateClose = dateClose {
            try container.encode(formatter.string(from: dateClose), forKey: .dateClose)
        }
    }
}


extension Incident {
    convenience init(from dto: IncidentDTO) {
        self.init(
            id: dto.id,
            salleId: dto.salleId,
            matricule: dto.matricule,
            status: dto.status,
            title: dto.title,
            descriptionIncident: dto.descriptionIncident,
            dateOpen: dto.dateOpen,
            dateClose: dto.dateClose
        )
    }
    
}


extension IncidentDTO {
    init(from incident: Incident) {
        self.id = incident.id
        self.salleId = incident.salle?.id ?? ""
        self.matricule = incident.employe?.matricule ?? ""
        self.status = incident.status
        self.title = incident.title
        self.descriptionIncident = incident.descriptionIncident
        self.dateOpen = incident.dateOpen
        self.dateClose = incident.dateClose
    }
}
