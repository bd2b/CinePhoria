//
//	CinePhoriaTestApp.swift
//	CinePhoriaTest
//
//  Cree par Bruno DELEBARRE-DEBAY on 23/11/2024.
//  bd2db
//


import SwiftUI

@main
struct CinePhoriaTestApp: App {
    @State private var dataController = DataController()
    var body: some Scene {
        WindowGroup {
         //   FilmView(film: filmsData[0] )
            ContentView()
                .environment(dataController)
        }
    }
}
