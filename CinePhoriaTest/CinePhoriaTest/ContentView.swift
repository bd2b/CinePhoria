//
//	ContentView.swift
//	CinePhoriaTest
//
//  Cree par Bruno DELEBARRE-DEBAY on 23/11/2024.
//  bd2db
//


import SwiftUI

struct ContentView: View {
    @Environment(DataController.self) private var dataController
    var body: some View {
        CardsReservationView(reservations: dataController.reservations)
    }
}

#Preview {
    ContentView()
}
