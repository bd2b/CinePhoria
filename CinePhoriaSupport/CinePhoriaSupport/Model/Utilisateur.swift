//
//	Utilisateur.swift
//	CinePhoriaSupport
//
//  Cree par Bruno DELEBARRE-DEBAY on 03/05/2025.
//  bd2db
//


import Foundation

//export class ComptePersonne {
//  email!: string;
//  dateDerniereConnexion?: Date;
//  isValidated?: number;
//  utilisateurid?: string;
//  utilisateurDisplayName?: string;
//  matricule?: number;
//  isAdministrateur?: number;
//  lastnameEmploye?: string;
//  firstnameEmploye?: string;
//  listCinemas?: string;
//  numConnexions?: number;
//  constructor(data: Partial<ComptePersonne>) {
//    Object.assign(this, data);
//  }
//}
struct UtilisateurDTO: Codable {
    var email: String
    var dateDerniereConnexion: Date
    var matricule: Int
    var isAdministrateur: Bool
    var lastnameEmploye: String
    var firstnameEmploye: String
    var listCinemas: String
    
    enum CodingKeys: String, CodingKey {
            case email
            case dateDerniereConnexion
            case matricule
            case isAdministrateur
            case lastnameEmploye
            case firstnameEmploye
            case listCinemas
        }

        init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            email = try container.decode(String.self, forKey: .email)
            dateDerniereConnexion = try container.decode(Date.self, forKey: .dateDerniereConnexion)
            matricule = try container.decode(Int.self, forKey: .matricule)
            let intValue = try container.decode(Int.self, forKey: .isAdministrateur)
            isAdministrateur = intValue != 0
            lastnameEmploye = try container.decode(String.self, forKey: .lastnameEmploye)
            firstnameEmploye = try container.decode(String.self, forKey: .firstnameEmploye)
            listCinemas = try container.decode(String.self, forKey: .listCinemas)
        }

        func encode(to encoder: Encoder) throws {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try container.encode(email, forKey: .email)
            try container.encode(dateDerniereConnexion, forKey: .dateDerniereConnexion)
            try container.encode(matricule, forKey: .matricule)
            try container.encode(isAdministrateur ? 1 : 0, forKey: .isAdministrateur)
            try container.encode(lastnameEmploye, forKey: .lastnameEmploye)
            try container.encode(firstnameEmploye, forKey: .firstnameEmploye)
            try container.encode(listCinemas, forKey: .listCinemas)
        }
    
}

