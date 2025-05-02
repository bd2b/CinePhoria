//
//	NoDataView.swift
//	CinePhoriaSupport
//
//  Cree par Bruno DELEBARRE-DEBAY on 02/05/2025.
//  bd2db
//


import Foundation
import SwiftUI

struct NoDataView: View {
    @Bindable var dataController: DataController
    var body: some View {
        VStack {
            Text("😢")
                        .font(.system(size: 60)) // Taille personnalisée
                        .foregroundColor(.blue) // Couleur de l'emoji
                        
                        .cornerRadius(10)
                        .padding()
            
            Text("Nous n'avons pas pu récupérer les données demandées. Contactez votre support ou changer de compte")
            
            
            
            Button("Changer de compte") {
                dataController.isLoggedIn = false
            }
            .buttonStyle(.borderedProminent)
            .padding()
        }
    }
}
