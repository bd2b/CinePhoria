//
//	WelcomeScreenView.swift
//	CinePhoriaSupport
//
//  Cree par Bruno DELEBARRE-DEBAY on 01/05/2025.
//  bd2db
//


import Foundation


import SwiftUI
// import Giffy


struct WelcomeScreenView: View {
    @Binding var showWelcomeScreen: Bool

    var body: some View {
        VStack(spacing: 20) {
            Spacer()
            
            // Titre principal
            VStack(spacing: 8) {
                Text("Bienvenue à")
                    .font(customFont(style: .largeTitle))
                    .fontWeight(.bold)
                    .foregroundColor(.white)
     //           Giffy("camera-cinephoria2")
                        .frame( width: 200, height: 75)
            }
            .padding()

            // Section des items
            VStack(alignment: .leading, spacing: 20) {
                WelcomeItemView(
                    imageName: "qrcode.viewfinder",
                    title: "Évitez la file d'attente",
                    description: "Scannez votre QR Code pour entrer directement dans la salle. Gagnez du temps et profitez du cinéma sans stress."
                )

                WelcomeItemView(
                    imageName: "bubble.left.and.bubble.right.fill",
                    title: "Partagez votre avis",
                    description: "Exprimez votre passion de cinéphile en partageant vos avis sur les films que vous avez aimés ou pas !"
                )

                WelcomeItemView(
                    imageName: "gift.fill",
                    title: "Un cadeau pour vous",
                    description: "Au bout de 10 places réservées, nous vous offrons 5 € de friandise ! Un message apparaitra en dessous de votre QRCode."
                )
            }
            .padding(.horizontal)

            Spacer()

            // Bouton de démarrage
            Button(action: {
                UserDefaults.standard.hasSeenWelcomeScreen = true
                showWelcomeScreen = false
            }) {
                Text("C'est parti !")
                    .font(customFont(style: .title2))
                    .fontWeight(.bold)
                    .frame(maxWidth: .infinity)
                    .padding()
                 //   .background(.doréAccentuation)
                    .foregroundColor(.white)
                    .cornerRadius(10)
            }
            .padding()
        }
        .background(Color.black.edgesIgnoringSafeArea(.all))
    }
}

struct WelcomeItemView: View {
    let imageName: String
    let title: String
    let description: String

    var body: some View {
        HStack(alignment: .top, spacing: 15) {
            Image(systemName: imageName)
                .font(.title)
          //      .foregroundColor(.doréAccentuation)
                .frame(width: 40, height: 40)
            
            VStack(alignment: .leading, spacing: 5) {
                Text(title)
                    .font(customFont(style: .headline))
                    .foregroundColor(.white)
                Text(description)
                    .font(customFont(style: .subheadline))
                    .foregroundColor(.gray)
            }
        }
    }
}

//#Preview {
//    WelcomeScreenView(showWelcomeScreen: .constant(true))
//}

