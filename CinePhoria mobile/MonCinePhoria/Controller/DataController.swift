//
//	DataController.swift
//	MonCinePhoria
//
//  Cree par Bruno DELEBARRE-DEBAY on 23/11/2024.
//  bd2db
//

/// 1- Utilisation de la macro Observable disponible à partir de iOS 17 et remplaçant le protocole Observable
/// Rendre la class @Observable
///
///  2- Utilisation dans l'application pour la déclaration au niveau de l'APP
///  @main
///  struct BookReaderApp: App {
///      @State private var library = Library()
///
///
///      var body: some Scene {
///          WindowGroup {
///              LibraryView()
///                  .environment(library)
///          }
///      }
///  }
/// 3- Utilisation dans une view
///     struct LibraryView: View {
///         @Environment(Library.self) private var library
///
///         var body: some View {
///             List(library.books) { book in
///                 BookView(book: book)
///             }
///         }
///     }
///
/// 4- Utilisation dans les class
/// @Observable class Book: Identifiable {
///  var title = "Sample Book Title"
///  let id = UUID() // A unique identifier that never changes.
///  }
///
/// 5- Pour une view qui a besoin d'une propriété en lecture seule
///struct BookView: View {
///  var book: Book
///  @State private var isEditorPresented = false
///
///  var body: some View {
///      HStack {
///          Text(book.title)
///          Spacer()
///          Button("Edit") {
///              isEditorPresented = true
///          }
///      }
///      .sheet(isPresented: $isEditorPresented) {
///          BookEditView(book: book)
///      }
///  }
///  }
///
///  6- Pour une vue qui met à jour une des propriétés
///  struct BookEditView: View {
///     @Bindable var book: Book
///     @Environment(\.dismiss) private var dismiss
///
///     var body: some View {
///         VStack() {
///             TextField("Title", text: $book.title)
///                 .textFieldStyle(.roundedBorder)
///                 .onSubmit {
///                     dismiss()
///                 }
///
///             Button("Close") {
///                 dismiss()
///             }
///             .buttonStyle(.borderedProminent)
///         }
///         .padding()
///     }
///     }
///
///

import Foundation



@Observable class DataController: ObservableObject {
    
    var reservations: [Reservation] = []
    
    var isLoggedIn: Bool = false // État de connexion
    var isLoadingReservations: Bool = true // Indicateur de chargement des réservations
    
    var showWelcomeScreen: Bool = !UserDefaults.standard.hasSeenWelcomeScreen
    
    var numberErrorLogin: Int = 0 {
        didSet {
            if numberErrorLogin >= 3 {
                // Forçage de la suppression des donnees
                deleteData()
            }
        }
    }
    var rememberMe: Bool = UserDefaults.standard.rememberMe
    var userMail: String?
    
    var promoFriandiseDiscount: Double = 5.0
    
    /// Suppression des données
    func deleteData () {
        
        isLoggedIn = false
        rememberMe = false
        UserDefaults.standard.rememberMe = false
        
        if let userMail = userMail {
            do {
                try deleteValue(for: userMail , and: "com.db2db.MonCinePhoria")
                UserDefaults.standard.removeObject(forKey: UserDefaults.Keys.lastUserLogin)
                self.userMail = nil
            } catch {
                print(error.localizedDescription)
            }
        }
        deleteReservationsToLocal()
    }
    
    /// Réinitialisation complete = suppression des données + présentation de l'écran d'accueil
    func reinit () {
        deleteData()
        showWelcomeScreen = true
        UserDefaults.standard.hasSeenWelcomeScreen = false
        
        numberErrorLogin = 0
    }
    
    func getLastUser() -> String? {
        return UserDefaults.standard.lastUserLogin
    }
    
    func getPassword(for user: String) -> String? {
        print("GetValue: \(user)")
        if !user.isEmpty {
            return try? getValue(for: user, and: "com.db2db.MonCinePhoria")
        }
        return nil
    }
    
    func login(user: String, pwd: String, rememberMe: Bool) async throws -> Bool {
        do {
            try await loginApi(compte: user, password: pwd)
            self.userMail = user
            
            await loadReservations(for: user)
            UserDefaults.standard.rememberMe = rememberMe
            if rememberMe {
                do {
                    print("SetValue: \(user), \(pwd)")
                    try setValue(pwd, for: user, and: "com.db2db.MonCinePhoria")
                    UserDefaults.standard.lastUserLogin = user
                } catch {
                    print("erreur sur setValue: \(error)")
                }
            }
            return true
        } catch {
            print("Erreur de connexion 1: \(error)")
            numberErrorLogin += 1
            return false
        }
    }
    
    func login2(user: String, pwd: String, rememberMe: Bool) -> Bool {
        
        let userAuthorized = [ "admin", "user@example.com", "vide@example.com", "error@example.com", "inedit"]
        
        let loginSuccess =  userAuthorized.contains(user) && pwd == "password"
        
        if !loginSuccess { numberErrorLogin += 1 }
        
        if loginSuccess {
            self.userMail = user
            UserDefaults.standard.rememberMe = rememberMe
        }
        
        if rememberMe && loginSuccess{
            do {
                print ("SetValue: \(user), \(pwd)")
                try setValue(pwd, for: user, and: "com.db2db.MonCinePhoria")
                UserDefaults.standard.lastUserLogin = user
            } catch {
                print("erreur sur setValue: \(error)")
            }
        }
        return loginSuccess
        
    }
    
    func forgottenPassword (mail: String) {
        print("Mode passe oublié pour \(mail)")
    }
    
    func loadReservations(for userMail: String) async {
   
        do {
            reservations = try await getReservationForUtilisateur(email: userMail + "-")
            saveReservationsToLocal()
            
            isLoadingReservations = false;
            
            // Trier les réservations par date de séance (de la plus ancienne à la plus récente)
            let sortedReservations = reservations.sorted { $0 > $1 }
            var totalSeatsReserved = 0

            // Parcourir les réservations récupérées pour calculer la promotion friandise
            for reservation in sortedReservations {
                print(reservation.titleFilm)
                // Calculer le total de places pour cette réservation
                let seatsInReservation = reservation.totalSeats

                // Initialiser le drapeau pour la promo
                var isPromo = false

                // Vérifier pour chaque place dans la réservation si elle déclenche une promo
                for i in 1...seatsInReservation {
                    let beforeCurrentSeat = totalSeatsReserved + i       // Places avant cette réservation
                    let afterCurrentSeat = totalSeatsReserved + seatsInReservation - i + 1 // Places après cette réservation

                    if beforeCurrentSeat % 10 == 0 || afterCurrentSeat % 10 == 0 {
                        isPromo = true
                        break
                    }
                }

                // Ajouter au total global
                totalSeatsReserved += seatsInReservation

                // Définir les valeurs de promo et places restantes
                if isPromo {
                    reservation.isPromoFriandise = true
                    reservation.numberSeatsRestingBeforPromoFriandise = nil
                } else {
                    reservation.isPromoFriandise = false
                    reservation.numberSeatsRestingBeforPromoFriandise = 10 - (totalSeatsReserved % 10)
                }
            }
        
            // Mettre à jour les réservations
            self.reservations = sortedReservations.reversed()
        } catch {
            // On va utiliser les données locales
            print("Erreur de recupération des reservations : \(error)")
            loadReservationsFromLocal()
            isLoadingReservations = false;
        }
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
