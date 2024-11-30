//
//	NoReservationView.swift
//	CinePhoriaTest
//
//  Cree par Bruno DELEBARRE-DEBAY on 29/11/2024.
//  bd2db
//


import SwiftUI

struct NoReservationView: View {
    @Bindable var dataController: DataController
    var body: some View {
        VStack {
            Text("😢")
                        .font(.system(size: 60)) // Taille personnalisée
                        .foregroundColor(.blue) // Couleur de l'emoji
                        
                        .cornerRadius(10)
                        .padding()
            
            Text("Vous n'avez pas de réservation à venir ou passée, rendez vous sur notre site pour en faire une, ou changez de compte")
            
            
            Button("Allez sur le site Cinephoria") {
                openWebsite(urlString: "https://www.google.fr")
            }
            .buttonStyle(.borderedProminent) // Style de bouton optionnel
            .padding()
            Button("Changer de compte") {
                dataController.isLoggedIn = false
            }
            .buttonStyle(.borderedProminent)
            .padding()
        }
        
    }
    func openWebsite(urlString: String) {
        dataController.isLoggedIn = false
        if let url = URL(string: urlString) {
            UIApplication.shared.open(url)
        } else {
            print("URL invalide : \(urlString)")
        }
    }
}

#Preview {
    @Previewable @State var dataController = DataController()
    NoReservationView(dataController: dataController)
}
