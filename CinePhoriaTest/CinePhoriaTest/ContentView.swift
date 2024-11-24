//
//	ContentView.swift
//	CinePhoriaTest
//
//  Cree par Bruno DELEBARRE-DEBAY on 23/11/2024.
//  bd2db
//


import SwiftUI

struct ContentView: View {
    var body: some View {
        CardsReservationView(reservations: Reservation.samplesReservation)
    }
}

#Preview {
    ContentView()
}
