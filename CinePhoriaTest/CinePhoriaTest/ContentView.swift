//
//	ContentView.swift
//	CinePhoriaTest
//
//  Cree par Bruno DELEBARRE-DEBAY on 23/11/2024.
//  bd2db
//


import SwiftUI

struct ContentView: View {
    @Bindable var dataController: DataController
    
    var body: some View {
        if dataController.isLoggedIn
           {
            CardsReservationView(dataController: dataController)
        } else {
            LoginView(dataController: dataController) // Affiche la vue de connexion
                
        }
        
    }
}

#Preview {
    @Previewable @State var dataController = DataController()
    ContentView(dataController: dataController)
        .environment(dataController)
}
