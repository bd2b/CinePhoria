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
                .font(.title)
                .bold()
                .padding(.bottom, 10)
                .padding(.top, 100)
            if reservation.numberPMR > 1 {
                
                Text("^[\(reservation.numberPMR) places](inflect: true)")
                HStack (spacing:0) {
                    Text("^[\(totalSeats) places](inflect: true)")
                    Text(" dont ")
                    Text("^[\(reservation.numberPMR) places](inflect: true)")
                    Text(" Personne Mobilité Réduite")
                }
            } else if reservation.numberPMR == 1 {
                HStack (spacing:0) {
                    if totalSeats == 1 {
                        Text("1 place Personne Mobilité Réduite")
                    } else {
                        Text("^[\(totalSeats) places](inflect: true)")
                        Text(" dont 1 Personne Mobilité Réduite")
                    }
                }
            } else {
                Text("^[\(totalSeats) places](inflect: true)")
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
                        .font(.headline)
                    Spacer()
                    Text("\(seat.numberSeats) x \(seat.price, specifier: "%.2f") €")
                        .font(.subheadline)
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
                    .font(.title2)
                    .bold()
            }
        }
        .padding(EdgeInsets(top: 10, leading: 20, bottom: 0, trailing: 20))
        Spacer()
        HStack {
            Button(action: { dismiss() } ) {
                Label("Valider", systemImage: "checkmark")
                    .padding(10)
                    .font(.title)
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
