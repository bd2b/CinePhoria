//
//    FilmView.swift
//    MonCinePhoria
//
//  Cree par Bruno DELEBARRE-DEBAY on 23/11/2024.
//  bd2db
//


import SwiftUI

struct CaracteristiqueFilmView: View {

    var reservation: Reservation
    
    var body: some View {
        HStack  {
            Text(reservation.genreArray)
                .font(customFont(style: .body))
                .accessibilityIdentifier("genre")
                
            Spacer()
            HStack {
                Spacer()
                Text(reservation.categorySeeing)
                    .font(customFont(style: .body))
                    .frame(minHeight: 30, maxHeight: 30)
                    .padding(.horizontal)
                    .foregroundStyle(.white)
                    .background(.doréAccentuation)
                    .clipShape(.rect(cornerRadius: 10))
                    .background(
                        RoundedRectangle(cornerRadius: 10)
                            .fill(.doréAccentuation.mix( with: .black, by: 0.25))
                            .offset(y: 4)
                    )
                    .accessibilityIdentifier("categorie")
                
                
                Text(String(reservation.duration))
                    .font(customFont(style: .body))
                    .accessibilityIdentifier("duration")
            }
        }
        .padding()
    }
}


struct FilmView: View {
    var reservation: Reservation
    var imageFilmView: AnyView? = nil
    
    var body: some View {
        VStack (alignment: .leading) {
            ScrollView  {
                HStack {
                    
                    Group {
                        if let image = imageFilmView {
                            image
                        } else {
                            AnyView(getImageFilm(value: reservation.imageFilm1024))
                        }
                    }
                        
                        .scaledToFit()
                        .accessibilityIdentifier("imageFilm")
                            
//                            .resizable()
                            .scaledToFit()
                            .accessibilityIdentifier("imageFilm")
                    
                }
                .frame(maxWidth: .infinity, maxHeight: 300)
                .padding(.vertical)
                
                VStack  {
                    Text(reservation.titleFilm)
                        .font(customFont(style: .largeTitle))
                        .accessibilityIdentifier("titreFilm")
                    
                    CaracteristiqueFilmView(reservation: reservation)
                    
                    HStack {
                        
                        Text("Note : " + String(reservation.note ?? 0))
                            .font(customFont(style: .body))
                            .accessibilityIdentifier("note")
                        if reservation.isCoupDeCoeur {
                            Spacer()
                            Text("Coup de coeur")
                                .font(customFont(style: .body))
                                .accessibilityIdentifier("coupDeCoeur")
                            Image(systemName: reservation.isCoupDeCoeur ? "heart.fill" : "heart")
                                .foregroundColor(.rougeSombreErreur)
                        }
                        
                       
                        
                    }
                    .padding()
                    Text( reservation.filmDescription )
                        .font(customFont(style: .body))
                        .padding()
                        .background(.blancCasseSecondaire)
                        
                        .clipShape(.rect(cornerRadius: 10))
                        .padding()
                        .accessibilityIdentifier("description")
                        
                    Spacer()
                    Text(reservation.filmAuthor )
                        .font(customFont(style: .body))
                        .padding()
                        .accessibilityIdentifier("author")
                    Text(reservation.filmDistribution )
                        .font(customFont(style: .body))
                        .padding()
                        .accessibilityIdentifier("distribution")
                }
                
            }
            .background(.grisPerleFond)
            .clipShape(.rect(cornerRadius: 10))
            
            .background(
                RoundedRectangle(cornerRadius: 10)
                    .fill( .grisPerleFond.opacity(0.25))
                    .offset(y: 4
                           )
            )
            
            .overlay {
                RoundedRectangle(cornerRadius: 10)
                    .strokeBorder ( .argentéTertiaire , lineWidth: 1)
            }
            
            
        }
        .navigationTitle(reservation.titleFilm)
        
    }
       
}

//#Preview {
//    FilmView(film: filmsData.first!)
//}
