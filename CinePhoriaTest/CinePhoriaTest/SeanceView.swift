//
//	SeanceView.swift
//	CinePhoriaTest
//
//  Cree par Bruno DELEBARRE-DEBAY on 24/11/2024.
//  bd2db
//


import SwiftUI



struct SeanceView: View {
    var seance: Seance
    var body: some View {
        VStack {
            Text("Seance View")
                .font(.headline)
                .padding()
            
            // Ajoutez la vue UIKit encapsulée ici
            VStack {
                Text(seance.hourBegin)
                    .font(customFont(style: .title, fontName: "LCD14"))
                Text("(fin: \(seance.hourEnd))")
                    .font(customFont(style: .caption))
                
                HStack (spacing:15) {
                    VStack (spacing: 0){
                        Text(helper.monthString(from: seance.date))
                            .font(.caption)
                            .frame(width: 40, height: 15)
                            .foregroundStyle(.white)
                            .background(.doréAccentuation)
                            .clipShape(CustomCornerRadiusShape(radius: 10, corners: [.topLeft, .topRight]))
                        
                        Text(helper.dayOfMonth(from: seance.date))
                            .font(.title3).bold()
                            .frame(width: 40, height: 25)
                            .background(Color.white) // Assurez une couleur de fond
                            .clipShape(CustomCornerRadiusShape(radius: 10, corners: [.bottomLeft, .bottomRight])) // Coins arrondis
                            .overlay( // Ajoute une bordure visible avec coins arrondis
                                CustomCornerRadiusShape(radius: 10, corners: [.bottomLeft, .bottomRight])
                                    .stroke(Color.primary, lineWidth: 0.5)
                            )
                            
                       
                    }
                    .frame(width: 40, height: 40)
                    
                    Text(seance.location)
                        .font(customFont(style: .title3))
                        .padding(.horizontal, 10)
                        .frame( height: 40)
                        .background(.doréAccentuation)
                        .foregroundStyle(.white)
                        .clipShape(.rect(cornerRadius: 12))
                        
                }
                
                HStack {
                    seance.qualite.image()
                        .resizable()
                        .frame(width: 40, height: 40)
                    
                    Text(seance.bo.rawValue)
                        .font(customFont(style: .title3))
                        .frame(width: 40, height: 32)
                        .background(
                            LinearGradient(
                                gradient: Gradient(colors: [.bleuNuitPrimaire, .grisPerleFond]),
                                startPoint: .top,
                                endPoint: .bottom
                                    )
                        )
                        .foregroundStyle(.white)
                        .clipShape(.rect(cornerRadius: 10))
                    
                }
                
            }
            .frame(width: 150, height: 150)
            .padding(10)
            .background(
                LinearGradient(
                    gradient: Gradient(colors: [.white, .grisPerleFond]),
                    startPoint: .top,
                    endPoint: .bottom
                        )
            )
            .clipShape(.rect(cornerRadius: 12)) // Coins arrondis
            .overlay( // Ajoute une bordure visible avec coins arrondis
                CustomCornerRadiusShape(radius: 12, corners: [ .allCorners])
                    .stroke(.grisPerleFond, lineWidth: 2)
                )
            
            
        }
    }
}

#Preview {
    SeanceView(seance: Seance.samples[0])
}
