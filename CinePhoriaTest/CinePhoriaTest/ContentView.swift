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
        ActionsView(reservation: Reservation(id: 1, seance: Seance.samples[1] , evaluation: """
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam ullamcorper tincidunt justo id dignissim. Quisque vel erat sit amet augue suscipit cursus. Curabitur tempor elit tellus, nec consequat orci egestas eget. Aenean vitae maximus ex, ac blandit sem. Nulla mattis magna volutpat, rhoncus quam quis, egestas diam. Nunc sit amet fringilla erat, sit amet tincidunt ante. Pellentesque nec urna vestibulum, porta risus at, tempus risus. Aenean vel turpis tincidunt lacus aliquam hendrerit porta nec quam. Maecenas id nunc sollicitudin, mattis velit in, bibendum quam. Maecenas non elementum orci. Aliquam ut dolor erat. Cras quis hendrerit eros. Praesent condimentum magna nec ipsum auctor volutpat. 
    """, note: 4.5))
    }
}

#Preview {
    ContentView()
}
