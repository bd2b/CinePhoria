//
//	FilmView.swift
//	MonCinePhoria
//
//  Cree par Bruno DELEBARRE-DEBAY on 23/11/2024.
//  bd2db
//


import SwiftUI

struct CaracteristiqueFilmView: View {
    var film: Film
    var body: some View {
        HStack  {
            Text(film.genre ?? "Indeterminé")
                .font(customFont(style: .body))
                
            Spacer()
            HStack {
                Spacer()
                Text(film.categorySeeing.rawValue)
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
                
                
                Text(film.duration ?? "Non connu")
                    .font(customFont(style: .body))
            }
        }
        .padding()
    }
}


struct FilmView: View {
    var film: Film
    
    var body: some View {
        VStack (alignment: .leading) {
            ScrollView  {
                HStack {
                    if let imageFilm = film.imageFilm {
                        imageFilm.image1024()
                            .resizable()
                            .scaledToFit()
                    }
                }
                .frame(maxWidth: .infinity, maxHeight: 300)
                .padding(.vertical)
                
                VStack  {
                    Text(film.titleFilm)
                        .font(customFont(style: .largeTitle))
                    
                    CaracteristiqueFilmView(film: film)
                    
                    HStack {
                        
                        Text("Note : " + String(film.note ?? 0))
                            .font(customFont(style: .body))
                        if film.isCoupDeCoeur {
                            Spacer()
                            Text("Coup de coeur")
                                .font(customFont(style: .body))
                            Image(systemName: film.isCoupDeCoeur ? "heart.fill" : "heart")
                                .foregroundColor(.rougeSombreErreur)
                        }
                        
                       
                        
                    }
                    .padding()
                    Text( film.filmDescription ?? "")
                        .font(customFont(style: .body))
                        .padding()
                        .background(.blancCasseSecondaire)
                        
                        .clipShape(.rect(cornerRadius: 10))
                        .padding()
                        
                    Spacer()
                    Text(film.filmAuthor ?? "")
                        .font(customFont(style: .body))
                        .padding()
                    Text(film.filmDistribution ?? "")
                        .font(customFont(style: .body))
                        .padding()
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
        .navigationTitle(film.titleFilm)
        
    }
       
}

#Preview {
    FilmView(film: filmsData.first!)
}
