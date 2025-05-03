//
//	LoginView.swift
//	CinePhoriaSupport
//
//  Cree par Bruno DELEBARRE-DEBAY on 01/05/2025.
//  bd2db
//


import Foundation

import SwiftUI
//import Giffy

struct LoginView: View {
    
    @Bindable var dataController: DataController
    
    @State private var userMail: String = ""
    @State private var password: String = ""
    
    @State private var loginError: String?
    @State private var isShowingAlert: Bool = false
    @State private var isLoading: Bool = false
    
    private var credentialsSection: some View {
        VStack(spacing: 5) {
            VStack {
                if let error = loginError {
                    Text(error)
                        .font(customFont(style: .caption))
                        .foregroundColor(.rougeSombreErreur)
                        .transition(.opacity)
                } else {
                    Text(" ")
                        .foregroundColor(.rougeSombreErreur)
                        .font(customFont(style: .caption))
                        .disabled(true)
                }

                TextField("Votre email", text: $userMail)
                    .font(customFont(style: .body))
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .disableAutocorrection(true)
            }

            SecureField("Mot de passe", text: $password)
                .font(customFont(style: .body))
                .textFieldStyle(RoundedBorderTextFieldStyle())

            HStack {
                Toggle(isOn: $dataController.rememberMe) {
                    Text("Se souvenir de moi")
                        .font(customFont(style: .body))
                }
                .toggleStyle(.switch)
                .accessibilityIdentifier("RememberMeToggle")
            }

            Button(action: login) {
                Text("Se connecter")
                    .font(customFont(style: .title3))
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(.doreAccentuation)
                    .foregroundColor(.white)
                    .cornerRadius(8)
            }

            HStack {
                Spacer()
                Button(action: {
                    isShowingAlert = true
                }) {
                    Text("Mot de passe oublié ?")
                        .font(customFont(style: .body))
                }
            }
        }
        .padding(.horizontal, 20)
        .onAppear() {
            userMail = "administrateur@7art.fr"
            password = "20Mai2025!"
        }
    }
    
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Spacer()
                //                HStack (alignment: .top){
                //                    Giffy("camera-cinephoria-fd-blanc-login-trous trnsp")
                //                        .frame(width: 200, height:200)
                //
                //                }
                
                Spacer()
                VStack (spacing: 5){
                    credentialsSection
                   // Champ sécurisé pour le mot de passe
                   
                }
                .padding(EdgeInsets(top: 0, leading: 20, bottom: 20, trailing: 20))
                
            }
            .padding(EdgeInsets(top: 50, leading: 20, bottom: 20, trailing: 20))
            .alert("Un message de réinitialisation de mot de passe va être envoyé à votre adresse mail. Si vous ne le recevez pas c'est que l'adresse mail communiquée est incorrecte ou que le mail est dans les SPAM.", isPresented: $isShowingAlert) {
                Button("Annuler") {
                    isShowingAlert = false
                }
                .font(customFont(style: .body))
                Button("OK") {
                    isShowingAlert = false
                    dataController.forgottenPassword(mail: userMail)
                }
            }
        }
        .onAppear()
        {
            if dataController.rememberMe,
               let userMail = dataController.getLastUser(),
               let password = dataController.getPassword(for: userMail) {
                self.userMail = userMail
                self.password = password
                
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .ignoresSafeArea()
        .background(.blancCasseSecondaire)
        .overlay(
            Group {
                if isLoading {
                    ProgressView("Connexion en cours...")
                        .progressViewStyle(CircularProgressViewStyle())
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .background(Color.black.opacity(0.4))
                }
            }
        )
        .onChange(of: dataController.isLoggedIn) { isLogged in
            if isLogged {
                isLoading = false
            }
        }
        
    }
    
    
    func login() {
                Task {
                    isLoading = true
                    defer { isLoading = false }
                    do {
                        if try await dataController.login(user: userMail, pwd: password, rememberMe: dataController.rememberMe) {
                            dataController.isLoggedIn = true
                        } else {
                            if loginError == nil {
                                loginError = "Nom d'utilisateur ou mot de passe incorrect."
                            }
                        }
                    } catch {
                        loginError = "Erreur lors de la tentative de connexion : \(error.localizedDescription)"
                    }
                }
    }
    
    
}

#Preview {
    let controller = DataController()
    return LoginView(dataController: controller)
}





