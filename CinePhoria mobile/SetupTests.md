# Initialisation de l'environnement de test
Deux environnements existent. Ils peuvent coexister dans la même target.
Swift testing ne traite pas des tests d'UI et des tests de performances. Pour cela on doit rester avec XCTests
Pour Swift testing : https://developer.apple.com/videos/play/wwdc2024/10179

##Notions de Swift Testing
## **func**

import Testing

@Test func videoMetadata() {
    // ...
}

** Avec un import **
import Testing
@testable import DestinationVideo

@Test("Check video metadata") func videoMetadata() {
    let video = Video(fileName: "By the Lake.mov")
    let expectedMetadata = Metadata(duration: .seconds(90))
    #expect(video.metadata == expectedMetadata)
}

## **Sub-Suite**

struct VideoTests {
    let video = Video(fileName: "By the Lake.mov")

    @Test("Check video metadata") func videoMetadata() {
        let expectedMetadata = Metadata(duration: .seconds(90))
        #expect(video.metadata == expectedMetadata)
    }

    @Test func rating() async throws {
        #expect(video.contentRating == "G")
    }

}

## ** Condition d'exécution **'
@Test(.enabled(if: AppFeatures.isCommentingEnabled))
func videoCommenting() {
    // ...
}

## ** Utilisation de tag **
@Test(.tags(.formatting)) func rating() async throws {
    #expect(video.contentRating == "G")
}

## ** Suite avec tag commun **
@Suite(.tags(.formatting))
struct MetadataPresentation {
    let video = Video(fileName: "By the Lake.mov")

    @Test func rating() async throws {
        #expect(video.contentRating == "G")
    }

    @Test func formattedDuration() async throws {
        let videoLibrary = try await VideoLibrary()
        let video = try #require(await videoLibrary.video(named: "By the Lake"))
        #expect(video.formattedDuration == "0m 19s")
    }
}

## ** Parametres d'exécution de test **
@Test(arguments: [
    "A Beach",
    "By the Lake",
    "Camping in the Woods",
])
func mentionedContinentCounts(videoName: String) async throws {
    let videoLibrary = try await VideoLibrary()
    let video = try #require(await videoLibrary.video(named: videoName))
    #expect(!video.mentionedContinents.isEmpty)
    #expect(video.mentionedContinents.count <= 3)
}



## Etape 1 : création de la target MonCinePhoriaSwiftTesting

Utilise le package Swift Testing
Créer la target MonCinePhoriaSwiftTesting avec l'environnement Swift Testing



The first step we need to complete is to add a test target to our project, which is where all the code for our tests will reside. 
To do that, go to the File menu and choose New > Target, filter by “Test”, then select Unit Testing Bundle. You can leave the default settings for this intact, so press Finish.


## Dépendance sur les framework
Si FLAnimatedImage est déjà installé mais pas correctement lié à la cible de test :
    1.    Allez dans Xcode > Target > Test Target > Build Phases > Link Binary With Libraries.
    2.    Cliquez sur le bouton +.
    3.    Recherchez et ajoutez le framework FLAnimatedImage.framework.  --> j'ai glissé depose'
