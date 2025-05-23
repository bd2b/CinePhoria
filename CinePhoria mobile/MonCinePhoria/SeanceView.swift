//
//	SeanceView.swift
//	MonCinePhoria
//
//  Cree par Bruno DELEBARRE-DEBAY on 24/11/2024.
//  bd2db
//


import SwiftUI



struct SeanceView: View {
    var reservation: Reservation
    @Environment(\.colorScheme) var colorScheme
    var body: some View {
        
        VStack {
            Text(reservation.hourBeginHHSMM)
                .font(customFont(style: .title, fontName: "LCD14"))
                .foregroundColor(.bleuNuitPrimaire)
            Text("(fin: \(reservation.hourEndHHSMM))")
                .font(customFont(style: .caption))
                .foregroundColor(.bleuNuitPrimaire)
            
            HStack (spacing:15) {
                VStack (spacing: 0){
                    Text(helper.monthString(from: reservation.dateJour))
                        .font(.caption)
                        .frame(width: 40, height: 15)
                        .foregroundStyle(.white)
                        .background(.doréAccentuation)
                        .clipShape(CustomCornerRadiusShape(radius: 10, corners: [.topLeft, .topRight]))
                    
                    Text(helper.dayOfMonth(from: reservation.dateJour))
                        .font(.title3).bold()
                        .foregroundColor(.bleuNuitPrimaire)
                        .frame(width: 40, height: 25)
                        .background(Color.white) // Assurez une couleur de fond
                        .clipShape(CustomCornerRadiusShape(radius: 10, corners: [.bottomLeft, .bottomRight])) // Coins arrondis
                        .overlay( // Ajoute une bordure visible avec coins arrondis
                            CustomCornerRadiusShape(radius: 10, corners: [.bottomLeft, .bottomRight])
                                .stroke(Color.primary, lineWidth: 0.5)
                        )
                    
                    
                }
                .frame(width: 40, height: 40)
                
                Text(reservation.nameSalle)
                    .font(customFont(style: .title3))
                    .padding(.horizontal, 10)
                    .frame( height: 40)
                    .background(.doréAccentuation)
                    .foregroundStyle(.white)
                    .clipShape(.rect(cornerRadius: 12))
                
            }
            
            HStack {
                if colorScheme == .light {
                    Text(reservation.qualite)
//                        .resizable()
                       // .frame(width: 40, height: 40)
                } else {
                    Text(reservation.qualite)
                        
                      //  .frame(width: 40, height: 40)
                       // .colorInvert()
                }
                Text(reservation.bo)
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

//#Preview {
//    SeanceView(seance: Seance.samples[0])
//}
