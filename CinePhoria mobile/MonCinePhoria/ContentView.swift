//
//	ContentView.swift
//	MonCinePhoria
//
//  Cree par Bruno DELEBARRE-DEBAY on 23/11/2024.
//  bd2db
//


import SwiftUI

struct ContentView: View {
    @Bindable var dataController: DataController
    @State private var errorMessage: String?
    
    var body: some View {
        
        if dataController.showWelcomeScreen {
            WelcomeScreenView(showWelcomeScreen: $dataController.showWelcomeScreen)
        } else {
            
            if dataController.isLoggedIn {
                if dataController.isLoadingReservations {
                    // Affichage de la vue de progression
                    ProgressView("Chargement des réservations...")
                        .font(customFont(style: .title3))
                        .progressViewStyle(CircularProgressViewStyle())
                        .padding()
                } else if let errorMessage = errorMessage {
                    // Affichage du message d'erreur
                    Text(errorMessage)
                        .font(customFont(style: .title3))
                        .foregroundColor(.red)
                        .padding()
                } else if dataController.reservations.count == 0 {
                    // Aucune réservation trouvée
                    NoReservationView(dataController: dataController)
                } else {
                    // Affichage de la liste des réservations
                    CardsReservationView(dataController: dataController)
                }
            } else {
                LoginView(dataController: dataController) // Affiche la vue de connexion
                
            }
            
        }
    }
}

//#Preview {
//    @Previewable @State var dataController = DataController()
//    ContentView(dataController: dataController)
//        .environment(dataController)
//}
