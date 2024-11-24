//
//	CardsReservationView.swift
//	CinePhoriaTest
//
//  Cree par Bruno DELEBARRE-DEBAY on 24/11/2024.
//  bd2db
//


import SwiftUI
import Giffy

struct CardsReservationView: View {
    let reservations: [Reservation]
    
    @State private var currentPage: Int = 0 // Index de la page actuelle

    var body: some View {
        GeometryReader { geometry in
            VStack {
                // Titre et logo
                if geometry.size.width > geometry.size.height {
                    // Mode paysage
                    HStack {
                        Giffy("camera-cinephoria2")
                            .frame(height: 75)
                        Spacer()
                        Text("Mes réservations")
                            .font(customFont(style: .largeTitle))
                            .multilineTextAlignment(.leading)
                    }
                    .frame( height: 100)
                } else {
                    // Mode portrait
                    VStack {
                        Giffy("camera-cinephoria2")
                            .frame(height: 50)
                        Text("Mes réservations")
                            .font(customFont(style: .largeTitle))
                            .multilineTextAlignment(.leading)
                    }
                    .frame(height: 150)
                }

                // Cartes avec TabView
                TabView(selection: $currentPage) {
                    ForEach(0..<reservations.count, id: \.self) { index in
                        CardReservationView(reservation: reservations[index], geometry: geometry)
                            .tag(index) // Associe chaque vue à un index
                    }
                }
                
                .tabViewStyle(PageTabViewStyle()) // Style de défilement par page
                .indexViewStyle(PageIndexViewStyle(backgroundDisplayMode: .always))
              
 
              //  .padding(.top, 10)
            }
        }
    }
}

// Vue pour une carte avec orientation adaptative
struct CardReservationView: View {
    var reservation: Reservation
    var geometry: GeometryProxy
    @Environment(\.colorScheme) var colorScheme
    

    var body: some View {
        if geometry.size.width > geometry.size.height {
            // Mode paysage : disposition horizontale
            HStack (spacing: 20) {
                if let imageFilm = reservation.film.imageFilm {
                    Image(imageFilm.image1024)
                        .resizable()
                        .scaledToFit()
                        .frame(width: geometry.size.width * 0.2, height: geometry.size.height * 0.6)
                        .cornerRadius(10)
                        .padding(.trailing, 10)
                }

                VStack(alignment: .leading, spacing: 10) {
                    if colorScheme == .dark {
                        Text(reservation.film.titleFilm)
                            .font(customFont(style: .title))
                            .bold()
                            .foregroundColor(.white)
                    } else {
                        Text(reservation.film.titleFilm)
                            .font(customFont(style: .title))
                            .bold()
                            .foregroundColor(.bleuNuitPrimaire)
                    }
                    

                    HStack (spacing: 40){
                        SeanceView(seance: reservation.seance)
                        ActionsView(reservation: reservation)
                    }
                }
                .padding()
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            
            .background(
                RoundedRectangle(cornerRadius: 15)
                    .fill(.blancCasseSecondaire)
                    .shadow(radius: 5)
            )
            .padding()
        } else {
            // Mode portrait : disposition verticale
            VStack {
                if let imageFilm = reservation.film.imageFilm {
                    Image(imageFilm.image1024)
                        .resizable()
                        .scaledToFit()
                        .frame(height: geometry.size.height * 0.4)
                        .cornerRadius(10)
                        .padding(.bottom, 10)
                }

                if colorScheme == .dark {
                    Text(reservation.film.titleFilm)
                        .font(customFont(style: .title))
                        .bold()
                        .foregroundColor(.white)
                } else {
                    Text(reservation.film.titleFilm)
                        .font(customFont(style: .title))
                        .bold()
                        .foregroundColor(.bleuNuitPrimaire)
                }

                HStack {
                    SeanceView(seance: reservation.seance)
                    ActionsView(reservation: reservation)
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 15)
                    .fill(.blancCasseSecondaire)
                    .shadow(radius: 5)
            )
            .padding(0)
        }
    }
}


#Preview {
    CardsReservationView(reservations: Reservation.samplesReservation)
}
