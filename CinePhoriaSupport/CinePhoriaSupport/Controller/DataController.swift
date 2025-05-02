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
    
    
    init() {
            do {
                modelContainer = try ModelContainer(for:Cinema.self, Salle.self, Employe.self, Incident.self)
          //      try syncData() // insertion des données si vide
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
                
                for dto in cinemaDTOs {
                    if try modelContext.fetchCount(FetchDescriptor<Cinema>(predicate: #Predicate { $0.nameCinema == dto.nameCinema })) == 0 {
                        let newCinema = Cinema(from: dto)
                        modelContext.insert(newCinema)
                    }
                }
                
                let salleDTOs = try await fetchAllSalles()
                
                for dto in salleDTOs {
                    let existing = try modelContext.fetch(FetchDescriptor<Salle>(predicate: #Predicate { $0.id == dto.id })).first
                    if existing == nil {
                        modelContext.insert(Salle(from: dto))
                    }
                }
                
                let employeDTOs = try await fetchAllEmployes()
                
                for dto in employeDTOs {
                    let existing = try modelContext.fetch(FetchDescriptor<Employe>(predicate: #Predicate { $0.matricule == dto.matricule })).first
                    if existing == nil {
                        modelContext.insert(Employe(from: dto))
                    }
                }
                isModelEmpty = await isZeroCountEntities()
                try modelContext.save()
                print("✅ Données synchronisées")
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
