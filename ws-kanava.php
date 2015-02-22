<?php include('header.php'); ?> 
<body>

    <!-- top navigation -->
    <?php include('navigation.php'); ?>

    <!-- Header Carousel -->
    <?php include('carousel.php'); carousel(1); ?>

    <!-- Page Content -->
    <div class="container">

        <!-- Page Heading/Breadcrumbs -->
        <div class="row">
            <div class="col-lg-12">
                <h1 class="page-header">ISECure WS-Kanava</h1>
            </div>
        </div>
        <!-- /.row -->

        <!-- Features Section -->
        <div class="row">
            <div class="col-md-8">
	      <p>WS-KANAVA LÄHDEKOODINA PALVELUKEHITTÄJILLE JA
	      OHJELMISTOTALOILLE, TAI SUORAAN PILVIPALVELUNA
	      YRITYKSILLE</p>
 
	      <p>Tarjoamme testatun ja verifioidun koodin täydellä
	      lisenssillä kehitys- ja asiakastarpeisiinne.</p>
 
	      <p><i>"ISECuren WS-kanavalla voi esimerkiksi ladata
	      automaattisesti konekieliset tiliotteet ja viitesiirrot
	      ja yhdistää ne korkealaatuisen JavaScript-kirjaston
	      kanssa interaktiivisten statistiikkojen
	      luomiseksi."</i></p>
 
	      <p>ISECuren WS-Kanava sisältää
	      WebService-pankkiyhteysohjelmisto SDK:n usealle
	      pankille: Nordea, DanskeBank, Osuuspankki,
	      S-Pankki/LähiTapiola, Ålandsbanken, Samlink -pankit:
	      Handelsbanken, Aktia, POP, Säästöpankki. Tuemme sekä
	      APP- että PKI-puolta (mm. sertifikaatin haku PIN
	      -koodilla ja uusinta). WS-kanava on ollut tuotannossa
	      yli 4 vuotta (Nordea, OP, DanskeBank) ja on käytössä
	      useilla asiakkailla.</p>
            </div>
            <div class="col-md-4">
	      <p>Selected-paketilla saat valitsemasi pankin WS-kanavan
	      lähdekoodin, Collaborator-paketilla saat mukaan
	      päivitykset ja pääset osallistumaan
	      mm. rajapintakehitykseen toiveidesi mukaan. Voit ostaa
	      myös WS-kanavan suoraan palveluna Hosting -paketilla
	      valitsemillesi tai kaikille pankeille.</p>
	      
              <a href="#" class="btn btn-primary">Kysy Lis&auml;&auml;</a>
            </div>
        </div>
        <!-- /.row -->

        <!-- Service Panels -->
        <!-- The circle icons use Font Awesome's stacked icon classes. For more information, visit http://fontawesome.io/examples/ -->
        <div class="row">
            <div class="col-lg-12">
                <h2 class="page-header"></h2>
            </div>
            <div class="col-md-4 col-sm-7">
                <div class="panel panel-default text-center">
                    <div class="panel-heading">
                        <h4>SELECTED CODE</h4>
                        <p>VALITTUJEN PANKKIEN WS-KANAVIEN KOODI</p>
                    </div>
                    <div class="panel-body">
			<p>Valitsemasi tuetut pankit</p>
			<ul>
			  <li>PHP5 (osin C) lähdekoodi, jonka pohjalta rakennat palvelun tai integraation
			  <li>Luokkapohjainen tai suora funktiokutsu -rajapinta
			  <li>Luokkapohjainen rajapinta lisäksi suojaa jokaisen pankkikoodin omaan prosessiin, jonka PHP rajapintaa voidaan edelleen rajoittaa ja tiukentaa (php-sandbox)
			  <li>Lähdekoodia ei saa jälleemyydä, eikä laittaa avoimeen jakeluun
			</ul>
                        <a href="#" class="btn btn-primary">Kysy Lis&auml;&auml;</a>
                    </div>
                </div>
            </div>
            <div class="col-md-4 col-sm-7">
                <div class="panel panel-default text-center">
                    <div class="panel-heading">
                        <h4>DEVELOPER ACCESS</h4>
			<p>KAIKKIEN PANKKIEN WS-KANAVAT + GITHUB + TUKIPALVELU</p>
                    </div>
                    <div class="panel-body">
 			<ul>
			  <li>"SELECTED CODE": kaikki tuetut pankit
			  <li>Pääsy koodin versionhallintaan (GitHub collaborator)
			  <li>Mahdollisuus osallistua kehitykseen, vaikuttaa ominaisuuksiin ja integrointeihin - koodisi pysyy ajan tasalla
			  <li>Automaattiset testit laadunvalvontaan (CI)
			  <li>Tietoturva- ja korjauspäivitykset
			  <li>Pankkien palvelusertifikaattien päivitykset
			  <li>Pankkien rajapintapäivitykset
			  <li>Tukipalvelu GitHubin tikettijärjestelmän kautta
			  <li>HUOM: Kysy myös erillisenä palveluna valmis ja ajantasainen pankki-integrointiympäristö
			</ul>
                        <a href="#" class="btn btn-primary">Kysy Lis&auml;&auml;</a>
                    </div>
                </div>
            </div>
            <div class="col-md-4 col-sm-7">
                <div class="panel panel-default text-center">
                    <div class="panel-heading">
                        <h4>+HOSTING</h4>
                        <p>WS-KANAVAT PILVIPALVELUNA</p>
                    </div>
                    <div class="panel-body">
			<ul>
			  <li>WS-kanava valitsemillesi pankeille Amazon AWS -pilvipalvelussa
			  <li>Amazon AWS KMS avaintenhallintaan perustuva sertifikaattien suojaus
			  <li>Automaattiset tietoturva- ja korjauspäivitykset
			  <li>Formaattimuunnokset, esim. JSON
			</ul>
                        <a href="#" class="btn btn-primary">Kysy Lis&auml;&auml;</a>
                    </div>
                </div>
            </div>
        </div>

        <!-- Service Tabs -->
	<!--
        <div class="row">
            <div class="col-lg-12">
            </div>
            <div class="col-lg-12">

                <ul id="myTab" class="nav nav-tabs nav-justified">
                    <li class="active"><a href="#service-one" data-toggle="tab"></i>SELECTED CODE</a>
                    </li>
                    <li class=""><a href="#service-two" data-toggle="tab"></i>DEVELOPER ACCESS</a>
                    </li>
                    <li class=""><a href="#service-three" data-toggle="tab"></i>+HOSTING</a>
                    </li>
                </ul>

                <div id="myTabContent" class="tab-content">
                    <div class="tab-pane fade active in" id="service-one">
                        <h4>SELECTED CODE</h4>
                    </div>
                    <div class="tab-pane fade" id="service-two">
                        <h4>DEVELOPER ACCESS</h4>
                    </div>
                    <div class="tab-pane fade" id="service-three">
                        <h4>+HOSTING</h4>
                    </div>
                </div>

            </div>
        </div>
        -->

        <!-- Features Section -->
        <?php include('contact.php'); ?>

        <hr>

        <!-- Footer -->
        <?php include('footer.php'); ?>

    </div>
    <!-- /.container -->

    <?php include('end.php'); static_page(); ?>

</body>

</html>