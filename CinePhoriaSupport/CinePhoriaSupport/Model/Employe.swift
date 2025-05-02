//
//	Employe.swift
//	CinePhoriaSupport
//
//  Cree par Bruno DELEBARRE-DEBAY on 01/05/2025.
//  bd2db
//


import Foundation
import SwiftData

@Model
class Employe {
    @Attribute(.unique) var matricule: String
    var email: String
    var isAdministrateur: Bool
    var lastnameEmploye: String
    var firstnameEmploye: String

    var incidents: [Incident] = []

    init(matricule: String, email: String, isAdministrateur: Bool,
         lastnameEmploye: String, firstnameEmploye: String) {
        self.matricule = matricule
        self.email = email
        self.isAdministrateur = isAdministrateur
        self.lastnameEmploye = lastnameEmploye
        self.firstnameEmploye = firstnameEmploye
    }
}

// MARK: - EmployeDTO
struct EmployeDTO: Codable {
    var matricule: String
    var email: String
    var isAdministrateur: Bool
    var lastnameEmploye: String
    var firstnameEmploye: String

    enum CodingKeys: String, CodingKey {
        case matricule
        case email
        case isAdministrateur
        case lastnameEmploye
        case firstnameEmploye
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        if let stringValue = try? container.decode(String.self, forKey: .matricule) {
            matricule = stringValue
        } else if let intValue = try? container.decode(Int.self, forKey: .matricule) {
            matricule = String(intValue)
        } else {
            throw DecodingError.typeMismatch(
                String.self,
                DecodingError.Context(
                    codingPath: [CodingKeys.matricule],
                    debugDescription: "Impossible de convertir matricule en String"
                )
            )
        }
        email = try container.decode(String.self, forKey: .email)
        
        let isAdminInt = try container.decode(Int.self, forKey: .isAdministrateur)
        isAdministrateur = isAdminInt != 0
        
        lastnameEmploye = try container.decode(String.self, forKey: .lastnameEmploye)
        firstnameEmploye = try container.decode(String.self, forKey: .firstnameEmploye)
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(matricule, forKey: .matricule)
        try container.encode(email, forKey: .email)
        try container.encode(isAdministrateur ? 1 : 0, forKey: .isAdministrateur)
        try container.encode(lastnameEmploye, forKey: .lastnameEmploye)
        try container.encode(firstnameEmploye, forKey: .firstnameEmploye)
    }
}


extension Employe {
    convenience init(from dto: EmployeDTO) {
        self.init(
            matricule: dto.matricule,
            email: dto.email,
            isAdministrateur: dto.isAdministrateur,
            lastnameEmploye: dto.lastnameEmploye,
            firstnameEmploye: dto.firstnameEmploye
        )
    }
}
