//
//	DataController.swift
//	CinePhoriaTest
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
    var reservations: [Reservation]
    var isLoggedIn: Bool = false // État de connexion
    var numberErrorLogin: Int = 0 {
        didSet {
            if numberErrorLogin >= 3 {
                rememberMe = false
            }
        }
    }
    var rememberMe: Bool
//    {
//        didSet {
//            UserDefaults.standard.set(rememberMe, forKey: "rememberMe")
//            if !rememberMe {
//                UserDefaults.standard.set("", forKey: "lastUserLogin")
//            }
//        }
//    }
    
    var userName: String?
    
    init() {
        self.reservations = Reservation.samplesReservation
        generateJSON(from: Reservation.samplesReservation, to: "Reservations.json")
        rememberMe = UserDefaults.standard.bool(forKey: "rememberMe")
        
    }
    
    func getLastUser() -> String? {
        return UserDefaults.standard.string(forKey: "lastUserLogin")
    }
    
    func getPassword(for user: String) -> String? {
        print("GetValue: \(user)")
        if !user.isEmpty {
            return try? getValue(for: user, and: "com.db2db.CinePhoriaTest")
        }
        return nil
    }
    
    func login(user: String, pwd: String, rememberMe: Bool) -> Bool {
        
        let loginSuccess = user == "admin" && pwd == "password"
        
        if !loginSuccess { numberErrorLogin += 1 }
        
        if loginSuccess {
            self.userName = user
            UserDefaults.standard.set(rememberMe, forKey: "rememberMe")
        }
        
        if rememberMe && loginSuccess{
            do {
                print ("SetValue: \(user), \(pwd)")
                try setValue(pwd, for: user, and: "com.db2db.CinePhoriaTest")
                UserDefaults.standard.set(user, forKey: "lastUserLogin")
            } catch {
                print("erreur sur setValue: \(error)")
            }
        }
        return loginSuccess
        
    }
    
    func forgottenPassword (mail: String) {
        print("Mode passe oublié pour \(mail)")
    }
    
}
    

