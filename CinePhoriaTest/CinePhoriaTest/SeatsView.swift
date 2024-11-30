//
//	SeatsView.swift
//	CinePhoriaTest
//
//  Cree par Bruno DELEBARRE-DEBAY on 25/11/2024.
//  bd2db
//


import SwiftUI

struct SeatsView: View {
    var reservation: Reservation
    
    var totalPrice: Double {
        reservation.seats.reduce(0) { $0 + $1.price * Double($1.numberSeats) }
    }
    var totalSeats: Int { reservation.seats.reduce(0) { $0 + $1.numberSeats } }
    
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        VStack(alignment: .leading, spacing: 30) {
            Text("Votre réservation")
                .font(customFont(style: .title))
                .bold()
                .padding(.bottom, 10)
                .padding(.top, 100)
            if reservation.numberPMR > 1 {
                
                Text("^[\(reservation.numberPMR) places](inflect: true)")
                    .font(customFont(style: .body))
                HStack (spacing:0) {
                    Text("^[\(totalSeats) places](inflect: true)")
                        .font(customFont(style: .body))
                    Text(" dont ")
                        .font(customFont(style: .body))
                    Text("^[\(reservation.numberPMR) places](inflect: true)")
                        .font(customFont(style: .body))
                    Text(" Personne Mobilité Réduite")
                        .font(customFont(style: .body))
                }
            } else if reservation.numberPMR == 1 {
                HStack (spacing:0) {
                    if totalSeats == 1 {
                        Text("1 place Personne Mobilité Réduite")
                            .font(customFont(style: .body))
                    } else {
                        Text("^[\(totalSeats) places](inflect: true)")
                            .font(customFont(style: .body))
                        Text(" dont 1 Personne Mobilité Réduite")
                            .font(customFont(style: .body))
                    }
                }
            } else {
                Text("^[\(totalSeats) places](inflect: true)")
                    .font(customFont(style: .body))
            }
            Divider()
            
            
            //            Text("Détails des places")
            //                .font(.title)
            //                .bold()
            //                .padding(.bottom, 10)
            
            // Liste des tarifs
            ForEach(reservation.seats, id: \.nameTarif) { seat in
                HStack {
                    Text(seat.nameTarif)
                        .font(customFont(style: .headline))
                    Spacer()
                    Text("\(seat.numberSeats) x \(seat.price, specifier: "%.2f") €")
                        .font(customFont(style: .subheadline))
                }
            }
            
            Divider()
            
            // Montant total
            HStack {
                //                Text(" ")
                //                    .font(.title2)
                //                    .bold()
                Spacer()
                Text("\(totalPrice, specifier: "%.2f") €")
                    .font(customFont(style: .title2))
                    .bold()
            }
        }
        .padding(EdgeInsets(top: 10, leading: 20, bottom: 0, trailing: 20))
        Spacer()
        HStack {
            Button(action: { dismiss() } ) {
                Label("Valider", systemImage: "checkmark")
                    .padding(10)
                    .font(customFont(style: .title))
            }
            
            .buttonStyle(.bordered)
            .buttonBorderShape(.circle)
            
            .frame(width: 100)
        }
        Spacer()
        
    }
    
    
}

#Preview {
    SeatsView(reservation: Reservation.samplesReservation[3])
}
