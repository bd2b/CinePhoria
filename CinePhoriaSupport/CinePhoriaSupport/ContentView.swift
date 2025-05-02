//
//	ContentView.swift
//	CinePhoriaSupport
//
//  Cree par Bruno DELEBARRE-DEBAY on 01/05/2025.
//  bd2db
//


import SwiftUI
import SwiftData
@MainActor
struct ContentView: View {
    @Environment(\.modelContext) private var modelContext
    @Bindable var dataController: DataController
    
    @State private var isLoaded = false
    @State private var errorMessage: String?
    
    var body: some View {
        if dataController.showWelcomeScreen {
            WelcomeScreenView(showWelcomeScreen: $dataController.showWelcomeScreen)
        } else {
            if dataController.isLoggedIn {
                if dataController.isLoadingModel {
                    // Affichage de la vue de progression
                    ProgressView("Chargement des données...")
                        .font(customFont(style: .title3))
                        .progressViewStyle(CircularProgressViewStyle())
                        .padding()
                } else if let errorMessage = errorMessage {
                    // Affichage du message d'erreur
                    Text(errorMessage)
                        .font(customFont(style: .title3))
                        .foregroundColor(.red)
                        .padding()
                }
                else if dataController.isModelEmpty {
                    NoDataView(dataController: dataController)
                } else {
                    MainView()
                }
            } else {
                LoginView(dataController: dataController)
            }
        }
    }
}
        
        //                  else {
        //                            LoginView(dataController: dataController) // Affiche la vue de connexion
        //
        //                        }
        //
        //                    }
        //
        //
        //
        //
        //
        //            Group {
        //                if isLoaded {
        //                    MainView(modelContext: modelContext)
        //                } else {
        //                    ProgressView("Chargement…")
        //                        .task {
        //                            let controller = DataController(modelContext: modelContext)
        //                            self.dataController = controller
        //                            self.isLoaded = true
        //                        }
        //                }
        //            }
        //        }
        
        //    var body: some View {
        //
        //        if dataController.showWelcomeScreen {
        //            WelcomeScreenView(showWelcomeScreen: $dataController.showWelcomeScreen)
        //        } else {
        //
        //            if dataController.isLoggedIn {
        //                if dataController.isLoadingReservations {
        //                    // Affichage de la vue de progression
        //                    ProgressView("Chargement des réservations...")
        //                        .font(customFont(style: .title3))
        //                        .progressViewStyle(CircularProgressViewStyle())
        //                        .padding()
        //                } else if let errorMessage = errorMessage {
        //                    // Affichage du message d'erreur
        //                    Text(errorMessage)
        //                        .font(customFont(style: .title3))
        //                        .foregroundColor(.red)
        //                        .padding()
        //                }
        //                else if dataController.reservations.count == 0 {
        //                    // Aucune réservation trouvée
        //                    NoReservationView(dataController: dataController)
        //                } else {
        //                    // Affichage de la liste des réservations
        //                    CardsReservationView(dataController: dataController)
        //                }
        //            } else {
        //                LoginView(dataController: dataController) // Affiche la vue de connexion
        //
        //            }
        //
        //        }
        
        
        
        //#Preview {
        //    ContentView()
        //}
