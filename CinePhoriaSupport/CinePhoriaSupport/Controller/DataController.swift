//
//    DataController.swift
//    CinePhoriaSupport
//
//  Cree par Bruno DELEBARRE-DEBAY on 01/05/2025.
//  bd2db
//


import Foundation
import SwiftData

@MainActor
@Observable class DataController: ObservableObject {
    
    let modelContainer: ModelContainer
    var modelContext: ModelContext { modelContainer.mainContext }
    
    var isLoggedIn: Bool = false  // État de connexion
    var isLoadingModel: Bool = true // Indicateur de chargement du model
    var isModelEmpty: Bool = true
    
    var showWelcomeScreen: Bool = !UserDefaults.standard.hasSeenWelcomeScreen
    var rememberMe: Bool = UserDefaults.standard.rememberMe
    var userMail: String?
    
    var utilisateurDTO: UtilisateurDTO?
    var employeCourant: Employe?
    
    
    init() {
        do {
            modelContainer = try ModelContainer(
                for: Cinema.self, Salle.self, Incident.self, Employe.self,
                configurations: .init(isStoredInMemoryOnly: true)
            )
        } catch {
            fatalError("❌ Échec de l'initialisation SwiftData : \(error)")
        }
    }
    
    func reinit () {
        showWelcomeScreen = true
        UserDefaults.standard.hasSeenWelcomeScreen = false
    }
    
    
    func syncInitialData() async {
        
        
        do {
            let cinemaDTOs: [CinemaDTO] = try await fetchAllCinemas()
            var cinemaMap: [String: Cinema] = [:]
            
            for dto in cinemaDTOs {
                if let existing = try modelContext.fetch(FetchDescriptor<Cinema>(predicate: #Predicate { $0.nameCinema == dto.nameCinema })).first {
                    cinemaMap[dto.nameCinema] = existing
                } else {
                    let newCinema = Cinema(from: dto)
                    modelContext.insert(newCinema)
                    cinemaMap[dto.nameCinema] = newCinema
                }
            }
            
            let salleDTOs = try await fetchAllSalles()
            var salleMap: [String: Salle] = [:]
            
            for dto in salleDTOs {
                if let existing = try modelContext.fetch(FetchDescriptor<Salle>(predicate: #Predicate { $0.id == dto.id })).first {
                    salleMap[dto.id] = existing
                } else {
                    let newSalle = Salle(from: dto)
                    if let cinema = cinemaMap[dto.nameCinema] {
                        newSalle.cinema = cinema
                    }
                    modelContext.insert(newSalle)
                    salleMap[dto.id] = newSalle
                }
            }
            
            
            let employeDTOs = try await fetchAllEmployes()
            var employeMap: [String: Employe] = [:]
            
            for dto in employeDTOs {
                if let existing = try modelContext.fetch(FetchDescriptor<Employe>(predicate: #Predicate { $0.matricule == dto.matricule })).first {
                    employeMap[dto.matricule] = existing
                } else {
                    let newEmploye = Employe(from: dto)
                    modelContext.insert(newEmploye)
                    employeMap[dto.matricule] = newEmploye
                }
            }
            
            // On met à jour l'employe courant
            if let matriculeEmpCourant = utilisateurDTO?.matricule
                 {
                let matriculeEmpCourantStr = String(matriculeEmpCourant)
                do {
                    let employe = try modelContext.fetch(
                        FetchDescriptor<Employe>(
                            predicate: #Predicate { $0.matricule == matriculeEmpCourantStr }
                        )
                    ).first
                    employeCourant = employe
                    
                } catch {
                    print("Erreur de chargement de l'employé : \(error)")
                }
            }
            let incidentDTOs = try await fetchAllIncidents()
            
            for dto in incidentDTOs {
                if try modelContext.fetch(FetchDescriptor<Incident>(predicate: #Predicate { $0.id == dto.id })).first == nil {
                    let newIncident = Incident(from: dto)
                    if let salle = salleMap[dto.salleId] {
                        newIncident.salle = salle
                    }
                    if let employe = employeMap[dto.matricule] {
                        newIncident.employe = employe
                    }
                    modelContext.insert(newIncident)
                }
            }
            
            
            
            isModelEmpty = await isZeroCountEntities()
            try modelContext.save()
            print("✅ Données synchronisées")
            
            
            // Statistiques relationnelles
            do {
                let cinemas = try modelContext.fetch(FetchDescriptor<Cinema>())
                for cinema in cinemas {
                    let nbSalles = cinema.salles?.count ?? 0
                    print("🎬 \(cinema.nameCinema) → \(nbSalles) salle(s)")
                }

                let salles = try modelContext.fetch(FetchDescriptor<Salle>())
                for salle in salles {
                    let nbIncidents = salle.incidents?.count ?? 0
                    print("🏛️ \(salle.nameSalle) → \(nbIncidents) incident(s)")
                }

                let employes = try modelContext.fetch(FetchDescriptor<Employe>())
                for employe in employes {
                    let nbIncidents = employe.incidents?.count ?? 0
                    print("👤 \(employe.firstnameEmploye) \(employe.lastnameEmploye) → \(nbIncidents) incident(s)")
                }

            } catch {
                print("❌ Erreur lors du comptage des relations : \(error)")
            }
        } catch {
            print("❌ Erreur de synchronisation initiale : \(error)")
        }
        
    }
    
    func isZeroCountEntities() async -> Bool{
        var cinemaCount = 0
        var salleCount = 0
        var employeCount = 0
        
        do {
            cinemaCount = try modelContext.fetchCount(FetchDescriptor<Cinema>())
            salleCount = try modelContext.fetchCount(FetchDescriptor<Salle>())
            employeCount = try modelContext.fetchCount(FetchDescriptor<Employe>())
            
        } catch {
            print("❌ Erreur lors du comptage des entités : \(error)")
            return true
        }
        return cinemaCount == 0 || salleCount == 0 || employeCount == 0
    }
    
    func getLastUser() -> String? {
        return UserDefaults.standard.lastUserLogin
    }
    
    func getPassword(for user: String) -> String? {
        print("GetValue: \(user)")
        if !user.isEmpty {
            return try? getValue(for: user, and: "com.db2db.CinePhoriaSupport")
        }
        return nil
    }
    
    func login(user: String, pwd: String, rememberMe: Bool) async throws -> Bool {
        do {
            try await loginApi(compte: user, password: pwd)
            self.userMail = user
            let utilisateurDTOArray = try await fetchUtilisateur(login: user)
            utilisateurDTO = utilisateurDTOArray.first!
            
            
            await syncInitialData()
            isLoadingModel = false
            
            UserDefaults.standard.rememberMe = rememberMe
            if rememberMe {
                do {
                    print("SetValue: \(user), *******")
                    try setValue(pwd, for: user, and: "com.db2db.CinePhoriaSupport")
                    UserDefaults.standard.lastUserLogin = user
                } catch {
                    print("erreur sur setValue: \(error)")
                }
            }
            return true
        } catch {
            
            print("Erreur de connexion 1: \(error)")
            
            return false
        }
    }
    
    func forgottenPassword (mail: String) {
        print("Mode passe oublié pour \(mail)")
    }
}


extension UserDefaults {
    enum Keys {
        static let hasSeenWelcomeScreen = "hasSeenWelcomeScreen"
        static let lastUserLogin = "lastUserLogin"
        static let rememberMe = "rememberMe"
    }
    
    var hasSeenWelcomeScreen: Bool {
        get { bool(forKey: Keys.hasSeenWelcomeScreen) }
        set { set(newValue, forKey: Keys.hasSeenWelcomeScreen) }
    }
    
    var lastUserLogin: String {
        get {
            if let lastUserLogin = string(forKey: Keys.lastUserLogin) {
                return lastUserLogin
            } else {
                return ""
            } }
        set { set(newValue, forKey: Keys.lastUserLogin) }
    }
    
    var rememberMe: Bool {
        get { bool(forKey: Keys.rememberMe) }
        set { set(newValue, forKey: Keys.rememberMe) }
    }
}
