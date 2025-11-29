<template>
	<main id="page" v-if="identifiant !== '' && statut === 'utilisateur'">
		<header class="dashboard-header">
			<div class="header-left">
				<a href="/" class="logo-link">
					<svg class="logo-icon" width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
						<rect width="40" height="40" rx="8" fill="url(#paint0_linear)"/>
						<path d="M12 14C12 12.8954 12.8954 12 14 12H18C19.1046 12 20 12.8954 20 14V26C20 27.1046 19.1046 28 18 28H14C12.8954 28 12 27.1046 12 26V14Z" fill="white"/>
						<path d="M22 14C22 12.8954 22.8954 12 24 12H26C27.1046 12 28 12.8954 28 14V22C28 23.1046 27.1046 24 26 24H24C22.8954 24 22 23.1046 22 22V14Z" fill="white" fill-opacity="0.7"/>
						<defs>
							<linearGradient id="paint0_linear" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
								<stop stop-color="#00ced1"/>
								<stop offset="1" stop-color="#00a5a8"/>
							</linearGradient>
						</defs>
					</svg>
					<span class="brand-text">ChaiPad</span>
				</a>
			</div>
			<div class="header-center">
				<h1 class="page-title">{{ $t('monCompte') }}</h1>
				<span class="welcome-text">Bienvenue, {{ nom || identifiant }}</span>
			</div>
			<div class="header-right">
				<span id="compte" role="button" tabindex="0" :title="$t('parametresCompte')" @click="menu = !menu">
					<i class="material-icons">settings</i>
				</span>
				<span id="deconnexion" role="button" tabindex="0" :title="$t('deconnexion')" @click="deconnexion">
					<i class="material-icons">logout</i>
				</span>
			</div>
		</header>

		<div class="menu gauche" :class="{'ouvert': menu}">
			<div class="en-tete">
				<span class="titre">{{ $t('parametresCompte') }}</span>
				<span role="button" tabindex="0" class="fermer" @click="menu = false"><i class="material-icons">close</i></span>
			</div>
			<div class="contenu ascenseur">
				<div class="conteneur">
					<label>{{ $t('langue') }}</label>
					<div id="langues">
						<span role="button" tabindex="0" :class="{'selectionne': langue === 'fr'}" @click="modifierLangue('fr')">FR</span>
						<span role="button" tabindex="0" :class="{'selectionne': langue === 'es'}" @click="modifierLangue('es')">ES</span>
						<span role="button" tabindex="0" :class="{'selectionne': langue === 'it'}" @click="modifierLangue('it')">IT</span>
						<span role="button" tabindex="0" :class="{'selectionne': langue === 'hr'}" @click="modifierLangue('hr')">HR</span>
						<span role="button" tabindex="0" :class="{'selectionne': langue === 'en'}" @click="modifierLangue('en')">EN</span>
					</div>
				</div>
				<div class="conteneur">
					<label for="identifiant">{{ $t('identifiant') }}</label>
					<input id="identifiant" type="text" readonly :value="identifiant">
				</div>
				<div class="conteneur">
					<label for="nom">{{ $t('nom') }}</label>
					<input id="nom" type="text" maxlength="48" :value="nom" @keydown.enter="modifierInformations">
				</div>
				<div class="conteneur">
					<label for="email">{{ $t('email') }}</label>
					<input id="email" type="text" :value="email" @keydown.enter="modifierInformations">
				</div>
				<div class="conteneur conteneur-bouton">
					<span role="button" tabindex="0" class="bouton-vert" @click="modifierInformations">{{ $t('enregistrer') }}</span>
				</div>
				<div class="conteneur conteneur-bouton">
					<span role="button" tabindex="0" class="bouton-bleu" @click="afficherModaleMotDePasse">{{ $t('modifierMotDePasse') }}</span>
				</div>
				<div class="conteneur conteneur-bouton">
					<span role="button" tabindex="0" class="bouton-rouge" @click="afficherModaleConfirmation($event, '', 'supprimer-compte')">{{ $t('supprimerCompte') }}</span>
				</div>
			</div>
		</div>

		<aside id="onglets" class="ascenseur">
			<div class="sidebar-section">
				<span class="section-title">Mes pads</span>
				<div class="onglet" :class="{'actif': onglet === 'pads-crees'}" @click="onglet = 'pads-crees'">
					<i class="material-icons tab-icon">dashboard</i>
					<span class="tab-label">{{ $t('padsCrees') }}</span>
					<span class="badge">{{ padsCrees.length }}</span>
				</div>
				<div class="onglet" :class="{'actif': onglet === 'pads-rejoints'}" @click="onglet = 'pads-rejoints'">
					<i class="material-icons tab-icon">group</i>
					<span class="tab-label">{{ $t('padsRejoints') }}</span>
					<span class="badge">{{ padsRejoints.length }}</span>
				</div>
				<div class="onglet" :class="{'actif': onglet === 'pads-admins'}" @click="onglet = 'pads-admins'">
					<i class="material-icons tab-icon">admin_panel_settings</i>
					<span class="tab-label">{{ $t('padsAdmins') }}</span>
					<span class="badge">{{ padsAdmins.length }}</span>
				</div>
				<div class="onglet" :class="{'actif': onglet === 'pads-favoris'}" @click="onglet = 'pads-favoris'">
					<i class="material-icons tab-icon">star</i>
					<span class="tab-label">{{ $t('favoris') }}</span>
					<span class="badge">{{ padsFavoris.length }}</span>
				</div>
			</div>

			<div class="sidebar-section">
				<span class="section-title">Integration</span>
				<div class="onglet onglet-classroom" :class="{'actif': onglet === 'google-classroom'}" @click="onglet = 'google-classroom'">
					<svg class="tab-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z" fill="currentColor"/>
						<path d="M12 7C10.9 7 10 7.9 10 9C10 10.1 10.9 11 12 11C13.1 11 14 10.1 14 9C14 7.9 13.1 7 12 7Z" fill="currentColor"/>
						<path d="M12 13C9.33 13 7 14.34 7 16V17H17V16C17 14.34 14.67 13 12 13Z" fill="currentColor"/>
					</svg>
					<span class="tab-label">Google Classroom</span>
				</div>
			</div>

			<div class="sidebar-section" v-if="dossiers.length > 0">
				<span class="section-title">Dossiers</span>
				<div class="onglet" v-for="(item, indexItem) in dossiers" :class="{'actif': onglet === item.id}" @click="onglet = item.id" :key="'dossier_' + indexItem">
					<i class="material-icons tab-icon">folder</i>
					<span class="tab-label">{{ item.nom }}</span>
					<span class="badge">{{ item.pads.length }}</span>
					<div class="menu-dossier">
						<span role="button" tabindex="0" class="bouton" :title="$t('modifierDossier')" @click="afficherModaleModifierDossier($event, item.id)"><i class="material-icons">edit</i></span>
						<span role="button" tabindex="0" class="bouton supprimer" :title="$t('supprimerDossier')" @click="afficherModaleConfirmation($event, item.id, 'supprimer-dossier')"><i class="material-icons">delete</i></span>
					</div>
				</div>
			</div>

			<button class="bouton-ajouter" role="button" tabindex="0" @click="afficherModaleAjouterDossier">
				<i class="material-icons">create_new_folder</i>
				{{ $t('ajouterDossier') }}
			</button>
		</aside>

		<!-- Section Google Classroom -->
		<div v-if="onglet === 'google-classroom'" id="google-classroom-section">
			<ClassroomManager :user-identifiant="$store.state.identifiant" :preselected-pads="selectedPads" @new-pad-created="onNewPadCreated" @pad-shared="onPadShared" />
		</div>

		<!-- Section Pads -->
		<div id="pads" class="ascenseur" :class="affichage" v-if="onglet !== 'google-classroom'">
			<div class="section">
				<div id="boutons">
					<span id="bouton-selectionner" role="button" tabindex="0" :class="{'actif': selectionMode}" :title="selectionMode ? 'Désactiver la sélection' : 'Sélectionner plusieurs pads'" @click="toggleSelectionMode">
						<i class="material-icons">{{ selectionMode ? 'close' : 'check_box' }}</i>
					</span>
					<span id="bouton-creer" :class="{'desactive': padsCrees.length >= limite}" role="button" tabindex="0" @click="afficherModaleCreerPad">{{ $t('creerPad') }}</span>
					<span id="bouton-importer" :class="{'desactive': padsCrees.length >= limite}" role="button" tabindex="0" @click="afficherModaleImporterPad">{{ $t('importerPad') }}</span>
				</div>
				<div id="filtrer">
					<div class="rechercher">
						<span><i class="material-icons">search</i></span>
						<input type="search" :value="requete" :placeholder="$t('rechercher')" @input="requete = $event.target.value">
					</div>
					<div class="filtrer">
						<span><i class="material-icons">sort</i></span>
						<select id="champ-filtrer" @change="modifierFiltre($event.target.value)">
							<option value="date-asc" :selected="filtre === 'date-asc'">{{ $t('dateAsc') }}</option>
							<option value="date-desc" :selected="filtre === 'date-desc'">{{ $t('dateDesc') }}</option>
							<option value="alpha-asc" :selected="filtre === 'alpha-asc'">{{ $t('alphaAsc') }}</option>
							<option value="alpha-desc" :selected="filtre === 'alpha-desc'">{{ $t('alphaDesc') }}</option>
						</select>
					</div>
					<div class="afficher">
						<span role="button" tabindex="0" :title="$t('affichageListe')" @click="modifierAffichage('liste')"><i class="material-icons">view_list</i></span>
						<span role="button" tabindex="0" :title="$t('affichageMosaique')" @click="modifierAffichage('mosaique')"><i class="material-icons">view_module</i></span>
					</div>
				</div>
				<div id="actions-dossier" v-if="onglet !== 'pads-crees' && onglet !== 'pads-rejoints' && onglet !== 'pads-admins' && onglet !== 'pads-favoris'">
					<div class="conteneur">
						<label>{{ $t('actionsDossier') }}</label>
						<span role="button" tabindex="0" class="bouton" :title="$t('modifierDossier')" @click="afficherModaleModifierDossier($event, onglet)"><i class="material-icons">edit</i></span>
						<span role="button" tabindex="0" class="bouton supprimer" :title="$t('supprimerDossier')" @click="afficherModaleConfirmation($event, onglet, 'supprimer-dossier')"><i class="material-icons">delete</i></span>
					</div>
				</div>
				<div class="pads" v-if="pads.length > 0 && requete === ''">
					<template v-for="(pad, indexPad) in pads">
						<div class="pad liste" :class="{'selection-mode': selectionMode, 'selected': isPadSelected(pad.id)}" v-if="affichage === 'liste'" :key="'pad_' + indexPad" @click="selectionMode ? togglePadSelection(pad) : null">
							<div class="pad-checkbox" v-if="selectionMode" @click.stop="togglePadSelection(pad)">
								<div class="checkbox" :class="{'checked': isPadSelected(pad.id)}">
									<i class="material-icons" v-if="isPadSelected(pad.id)">check</i>
								</div>
							</div>
							<a class="fond" :href="selectionMode ? null : '/p/' + pad.id + '/' + pad.token" :class="{'fond-personnalise': pad.fond.substring(1, 9) === 'fichiers'}" :style="definirFond(pad.fond)" @click.prevent="selectionMode ? togglePadSelection(pad) : navigateToPad(pad)" />
							<a class="meta" :class="{'pad-rejoint': pad.identifiant !== identifiant, 'deplacer': dossiers.length > 0}" :href="selectionMode ? null : '/p/' + pad.id + '/' + pad.token" @click.prevent="selectionMode ? togglePadSelection(pad) : navigateToPad(pad)">
								<span class="mise-a-jour" v-if="pad.hasOwnProperty('notification') && pad.notification.includes(identifiant)" />
								<span class="titre">{{ pad.titre }}</span>
								<span class="google-classroom-badges" v-if="getGoogleClassrooms(pad).length > 0">
									<span
										class="google-classroom-badge"
										v-for="(classroom, classIndex) in getGoogleClassrooms(pad)"
										:key="'classroom_' + classIndex"
										:style="{ backgroundColor: classroom.color || '#1967D2' }"
									>
										<i class="material-icons">school</i>
										{{ classroom.name }}
									</span>
								</span>
								<span class="date">{{ $t('creeLe') }} {{ $formaterDate(pad.date, langue) }}</span>
								<span class="auteur" v-if="pad.identifiant !== identifiant">{{ $t('par') }} {{ pad.identifiant }}</span>
								<span class="vues" v-if="pad.hasOwnProperty('vues') && pad.vues > 1">- {{ pad.vues }} {{ $t('vues') }}</span>
								<span class="vues" v-else-if="pad.hasOwnProperty('vues') && pad.vues < 2">- {{ pad.vues }} {{ $t('vue') }}</span>
								<span class="vues" v-else-if="!pad.hasOwnProperty('vues')">- 0 {{ $t('vue') }}</span>
							</a>
							<div class="actions" v-if="pad.identifiant === identifiant && !selectionMode">
								<span class="ajouter-favori" role="button" tabindex="0" @click="ajouterFavori(pad)" :title="$t('ajouterFavori')" v-if="!favoris.includes(pad.id)"><i class="material-icons">star_outline</i></span>
								<span class="supprimer-favori" role="button" tabindex="0" @click="supprimerFavori(pad.id)" :title="$t('supprimerFavori')" v-else><i class="material-icons">star</i></span>
								<span class="deplacer" role="button" tabindex="0" @click="afficherModaleDeplacerPad(pad.id)" :title="$t('ajouterDansDossier')" :class="{'actif': verifierDossierPad(pad.id)}" v-if="dossiers.length > 0"><i class="material-icons">drive_file_move</i></span>
								<span class="dupliquer" role="button" tabindex="0" @click="afficherModaleConfirmation($event, pad.id, 'dupliquer')" :title="$t('dupliquerPad')"><i class="material-icons">content_copy</i></span>
								<span class="exporter" role="button" tabindex="0" @click="afficherModaleConfirmation($event, pad.id, 'exporter')" :title="$t('exporterPad')"><i class="material-icons">get_app</i></span>
								<span class="supprimer" role="button" tabindex="0" @click="afficherModaleConfirmation($event, pad.id, 'supprimer')" :title="$t('supprimerPad')"><i class="material-icons">delete</i></span>
							</div>
							<div class="actions" v-else-if="!selectionMode">
								<span class="ajouter-favori" role="button" tabindex="0" @click="ajouterFavori(pad)" :title="$t('ajouterFavori')" v-if="!favoris.includes(pad.id)"><i class="material-icons">star_outline</i></span>
								<span class="supprimer-favori" role="button" tabindex="0" @click="supprimerFavori(pad.id)" :title="$t('supprimerFavori')" v-else><i class="material-icons">star</i></span>
								<span class="deplacer" role="button" tabindex="0" @click="afficherModaleDeplacerPad(pad.id)" :title="$t('ajouterDansDossier')" :class="{'actif': verifierDossierPad(pad.id)}" v-if="dossiers.length > 0"><i class="material-icons">drive_file_move</i></span>
								<span class="supprimer" role="button" tabindex="0" @click="afficherModaleConfirmation($event, pad.id, 'supprimer')" :title="$t('supprimerPad')" v-if="definirTypePad(pad.id) === 'pad-rejoint'"><i class="material-icons">delete</i></span>
								<span class="supprimer" role="button" tabindex="0" @click="afficherModaleConfirmation($event, pad.id, 'supprimer-admin')" :title="$t('quitterPad')" v-else-if="definirTypePad(pad.id) === 'pad-admin'"><i class="material-icons">logout</i></span>
								<span class="admin" :title="$t('admin')" v-if="definirTypePad(pad.id) === 'pad-admin'"><i class="material-icons">admin_panel_settings</i></span>
							</div>
						</div>

						<div class="pad mosaique" v-else :key="'pad_' + indexPad">
							<a class="conteneur" :class="{'fond-personnalise': pad.fond.substring(1, 9) === 'fichiers'}" :style="definirFond(pad.fond)" :href="'/p/' + pad.id + '/' + pad.token">
								<div class="meta">
									<span class="titre"><span class="mise-a-jour" v-if="pad.hasOwnProperty('notification') && pad.notification.includes(identifiant)" />{{ pad.titre }}</span>
									<span class="google-classroom-badges" v-if="getGoogleClassrooms(pad).length > 0">
										<span
											class="google-classroom-badge"
											v-for="(classroom, classIndex) in getGoogleClassrooms(pad)"
											:key="'mosaique_classroom_' + classIndex"
											:style="{ backgroundColor: classroom.color || '#1967D2' }"
										>
											<i class="material-icons">school</i>
											{{ classroom.name }}
										</span>
									</span>
									<span class="date">{{ $t('creeLe') }} {{ $formaterDate(pad.date, langue) }}</span>
									<span class="auteur" v-if="pad.identifiant !== identifiant">{{ $t('par') }} {{ pad.identifiant }}</span>
									<span class="vues" v-if="pad.hasOwnProperty('vues') && pad.vues > 1">- {{ pad.vues }} {{ $t('vues') }}</span>
									<span class="vues" v-else-if="pad.hasOwnProperty('vues') && pad.vues < 2">- {{ pad.vues }} {{ $t('vue') }}</span>
									<span class="vues" v-else-if="!pad.hasOwnProperty('vues')">- 0 {{ $t('vue') }}</span>
								</div>
							</a>
							<div class="actions" v-if="pad.identifiant === identifiant">
								<span class="ajouter-favori" role="button" tabindex="0" @click="ajouterFavori(pad)" :title="$t('ajouterFavori')" v-if="!favoris.includes(pad.id)"><i class="material-icons">star_outline</i></span>
								<span class="supprimer-favori" role="button" tabindex="0" @click="supprimerFavori(pad.id)" :title="$t('supprimerFavori')" v-else><i class="material-icons">star</i></span>
								<span class="deplacer" role="button" tabindex="0" @click="afficherModaleDeplacerPad(pad.id)" :title="$t('ajouterDansDossier')" :class="{'actif': verifierDossierPad(pad.id)}" v-if="dossiers.length > 0"><i class="material-icons">drive_file_move</i></span>
								<span class="dupliquer" role="button" tabindex="0" @click="afficherModaleConfirmation($event, pad.id, 'dupliquer')" :title="$t('dupliquerPad')"><i class="material-icons">content_copy</i></span>
								<span class="exporter" role="button" tabindex="0" @click="afficherModaleConfirmation($event, pad.id, 'exporter')" :title="$t('exporterPad')"><i class="material-icons">get_app</i></span>
								<span class="supprimer" role="button" tabindex="0" @click="afficherModaleConfirmation($event, pad.id, 'supprimer')" :title="$t('supprimerPad')"><i class="material-icons">delete</i></span>
							</div>
							<div class="actions" v-else>
								<span class="ajouter-favori" role="button" tabindex="0" @click="ajouterFavori(pad)" :title="$t('ajouterFavori')" v-if="!favoris.includes(pad.id)"><i class="material-icons">star_outline</i></span>
								<span class="supprimer-favori" role="button" tabindex="0" @click="supprimerFavori(pad.id)" :title="$t('supprimerFavori')" v-else><i class="material-icons">star</i></span>
								<span class="deplacer" role="button" tabindex="0" @click="afficherModaleDeplacerPad(pad.id)" :title="$t('ajouterDansDossier')" :class="{'actif': verifierDossierPad(pad.id)}" v-if="dossiers.length > 0"><i class="material-icons">drive_file_move</i></span>
								<span class="supprimer" role="button" tabindex="0" @click="afficherModaleConfirmation($event, pad.id, 'supprimer')" :title="$t('supprimerPad')" v-if="definirTypePad(pad.id) === 'pad-rejoint'"><i class="material-icons">delete</i></span>
								<span class="supprimer" role="button" tabindex="0" @click="afficherModaleConfirmation($event, pad.id, 'supprimer-admin')" :title="$t('quitterPad')" v-else-if="definirTypePad(pad.id) === 'pad-admin'"><i class="material-icons">logout</i></span>
								<span class="admin" :title="$t('admin')" v-if="definirTypePad(pad.id) === 'pad-admin'"><i class="material-icons">admin_panel_settings</i></span>
							</div>
						</div>
					</template>
				</div>
				<div class="vide" v-else-if="pads.length === 0 && requete === ''">
					<span v-if="onglet === 'pads-crees'">{{ $t('aucunPadCree') }}</span>
					<span v-else-if="onglet === 'pads-rejoints'">{{ $t('aucunPadRejoint') }}</span>
					<span v-else-if="onglet === 'pads-favoris'">{{ $t('aucunFavori') }}</span>
					<span v-else>{{ $t('aucunPadDossier') }}</span>
				</div>
				<div class="pads" v-else-if="resultats.length > 0 && requete !== ''">
					<template v-for="(pad, indexPad) in resultats">
						<div class="pad liste" v-if="affichage === 'liste'" :key="'pad_' + indexPad">
							<a class="fond" :href="'/p/' + pad.id + '/' + pad.token" :class="{'fond-personnalise': pad.fond.substring(1, 9) === 'fichiers'}" :style="definirFond(pad.fond)" />
							<a class="meta" :class="{'pad-rejoint': pad.identifiant !== identifiant, 'deplacer': dossiers.length > 0}" :href="'/p/' + pad.id + '/' + pad.token">
								<span class="mise-a-jour" v-if="pad.hasOwnProperty('notification') && pad.notification.includes(identifiant)" />
								<span class="titre">{{ pad.titre }}</span>
								<span class="google-classroom-badge" v-if="pad.googleClassroom">
									<i class="material-icons">school</i>
									{{ pad.googleClassroom }}
								</span>
								<span class="date">{{ $t('creeLe') }} {{ $formaterDate(pad.date, langue) }}</span>
								<span class="auteur" v-if="pad.identifiant !== identifiant">{{ $t('par') }} {{ pad.identifiant }}</span>
								<span class="vues" v-if="pad.hasOwnProperty('vues') && pad.vues > 1">- {{ pad.vues }} {{ $t('vues') }}</span>
								<span class="vues" v-else-if="pad.hasOwnProperty('vues') && pad.vues < 2">- {{ pad.vues }} {{ $t('vue') }}</span>
								<span class="vues" v-else-if="!pad.hasOwnProperty('vues')">- 0 {{ $t('vue') }}</span>
							</a>
							<div class="actions" v-if="pad.identifiant === identifiant">
								<span class="ajouter-favori" role="button" tabindex="0" @click="ajouterFavori(pad)" :title="$t('ajouterFavori')" v-if="!favoris.includes(pad.id)"><i class="material-icons">star_outline</i></span>
								<span class="supprimer-favori" role="button" tabindex="0" @click="supprimerFavori(pad.id)" :title="$t('supprimerFavori')" v-else><i class="material-icons">star</i></span>
								<span class="deplacer" role="button" tabindex="0" @click="afficherModaleDeplacerPad(pad.id)" :title="$t('ajouterDansDossier')" :class="{'actif': verifierDossierPad(pad.id)}" v-if="dossiers.length > 0"><i class="material-icons">drive_file_move</i></span>
								<span class="dupliquer" role="button" tabindex="0" @click="afficherModaleConfirmation($event, pad.id, 'dupliquer')" :title="$t('dupliquerPad')"><i class="material-icons">content_copy</i></span>
								<span class="exporter" role="button" tabindex="0" @click="afficherModaleConfirmation($event, pad.id, 'exporter')" :title="$t('exporterPad')"><i class="material-icons">get_app</i></span>
								<span class="supprimer" role="button" tabindex="0" @click="afficherModaleConfirmation($event, pad.id, 'supprimer')" :title="$t('supprimerPad')"><i class="material-icons">delete</i></span>
							</div>
							<div class="actions" v-else>
								<span class="ajouter-favori" role="button" tabindex="0" @click="ajouterFavori(pad)" :title="$t('ajouterFavori')" v-if="!favoris.includes(pad.id)"><i class="material-icons">star_outline</i></span>
								<span class="supprimer-favori" role="button" tabindex="0" @click="supprimerFavori(pad.id)" :title="$t('supprimerFavori')" v-else><i class="material-icons">star</i></span>
								<span class="deplacer" role="button" tabindex="0" @click="afficherModaleDeplacerPad(pad.id)" :title="$t('ajouterDansDossier')" :class="{'actif': verifierDossierPad(pad.id)}" v-if="dossiers.length > 0"><i class="material-icons">drive_file_move</i></span>
								<span class="supprimer" role="button" tabindex="0" @click="afficherModaleConfirmation($event, pad.id, 'supprimer')" :title="$t('supprimerPad')" v-if="definirTypePad(pad.id) === 'pad-rejoint'"><i class="material-icons">delete</i></span>
								<span class="supprimer" role="button" tabindex="0" @click="afficherModaleConfirmation($event, pad.id, 'supprimer-admin')" :title="$t('quitterPad')" v-else-if="definirTypePad(pad.id) === 'pad-admin'"><i class="material-icons">logout</i></span>
								<span class="admin" :title="$t('admin')" v-if="definirTypePad(pad.id) === 'pad-admin'"><i class="material-icons">admin_panel_settings</i></span>
							</div>
						</div>

						<div class="pad mosaique" v-else :key="'pad_' + indexPad">
							<a class="conteneur" :class="{'fond-personnalise': pad.fond.substring(1, 9) === 'fichiers'}" :style="definirFond(pad.fond)" :href="'/p/' + pad.id + '/' + pad.token">
								<div class="meta">
									<span class="titre"><span class="mise-a-jour" v-if="pad.hasOwnProperty('notification') && pad.notification.includes(identifiant)" />{{ pad.titre }}</span>
									<span class="google-classroom-badge" v-if="pad.googleClassroom">
										<i class="material-icons">school</i>
										{{ pad.googleClassroom }}
									</span>
									<span class="date">{{ $t('creeLe') }} {{ $formaterDate(pad.date, langue) }}</span>
									<span class="auteur" v-if="pad.identifiant !== identifiant">{{ $t('par') }} {{ pad.identifiant }}</span>
									<span class="vues" v-if="pad.hasOwnProperty('vues') && pad.vues > 1">- {{ pad.vues }} {{ $t('vues') }}</span>
									<span class="vues" v-else-if="pad.hasOwnProperty('vues') && pad.vues < 2">- {{ pad.vues }} {{ $t('vue') }}</span>
									<span class="vues" v-else-if="!pad.hasOwnProperty('vues')">- 0 {{ $t('vue') }}</span>
								</div>
							</a>
							<div class="actions" v-if="pad.identifiant === identifiant">
								<span class="ajouter-favori" role="button" tabindex="0" @click="ajouterFavori(pad)" :title="$t('ajouterFavori')" v-if="!favoris.includes(pad.id)"><i class="material-icons">star_outline</i></span>
								<span class="supprimer-favori" role="button" tabindex="0" @click="supprimerFavori(pad.id)" :title="$t('supprimerFavori')" v-else><i class="material-icons">star</i></span>
								<span class="deplacer" role="button" tabindex="0" @click="afficherModaleDeplacerPad(pad.id)" :title="$t('ajouterDansDossier')" :class="{'actif': verifierDossierPad(pad.id)}" v-if="dossiers.length > 0"><i class="material-icons">drive_file_move</i></span>
								<span class="dupliquer" role="button" tabindex="0" @click="afficherModaleConfirmation($event, pad.id, 'dupliquer')" :title="$t('dupliquerPad')"><i class="material-icons">content_copy</i></span>
								<span class="exporter" role="button" tabindex="0" @click="afficherModaleConfirmation($event, pad.id, 'exporter')" :title="$t('exporterPad')"><i class="material-icons">get_app</i></span>
								<span class="supprimer" role="button" tabindex="0" @click="afficherModaleConfirmation($event, pad.id, 'supprimer')" :title="$t('supprimerPad')"><i class="material-icons">delete</i></span>
							</div>
							<div class="actions" v-else>
								<span class="ajouter-favori" role="button" tabindex="0" @click="ajouterFavori(pad)" :title="$t('ajouterFavori')" v-if="!favoris.includes(pad.id)"><i class="material-icons">star_outline</i></span>
								<span class="supprimer-favori" @click="supprimerFavori(pad.id)" :title="$t('supprimerFavori')" v-else><i class="material-icons">star</i></span>
								<span class="deplacer" role="button" tabindex="0" @click="afficherModaleDeplacerPad(pad.id)" :title="$t('ajouterDansDossier')" :class="{'actif': verifierDossierPad(pad.id)}" v-if="dossiers.length > 0"><i class="material-icons">drive_file_move</i></span>
								<span class="supprimer" role="button" tabindex="0" @click="afficherModaleConfirmation($event, pad.id, 'supprimer')" :title="$t('supprimerPad')" v-if="definirTypePad(pad.id) === 'pad-rejoint'"><i class="material-icons">delete</i></span>
								<span class="supprimer" role="button" tabindex="0" @click="afficherModaleConfirmation($event, pad.id, 'supprimer-admin')" :title="$t('quitterPad')" v-else-if="definirTypePad(pad.id) === 'pad-admin'"><i class="material-icons">logout</i></span>
								<span class="admin" :title="$t('admin')" v-if="definirTypePad(pad.id) === 'pad-admin'"><i class="material-icons">admin_panel_settings</i></span>
							</div>
						</div>
					</template>
				</div>
				<div class="vide" v-else-if="resultats.length === 0 && requete !== ''">
					{{ $t('aucunResultat') }}
				</div>
			</div>
		</div>

		<div class="conteneur-modale" v-if="modaleMotDePasse">
			<div id="motdepasse" class="modale">
				<div class="en-tete">
					<span class="titre">{{ $t('modifierMotDePasse') }}</span>
					<span role="button" tabindex="0" class="fermer" @click="fermerModaleMotDePasse"><i class="material-icons">close</i></span>
				</div>
				<div class="conteneur">
					<div class="contenu">
						<label for="champ-motdepasse-actuel">{{ $t('motDePasseActuel') }}</label>
						<input id="champ-motdepasse-actuel" type="password" maxlength="48" :value="motDePasse" @input="motDePasse = $event.target.value">
						<label for="champ-nouveau-motdepasse">{{ $t('nouveauMotDePasse') }}</label>
						<input id="champ-nouveau-motdepasse" type="password" maxlength="48" :value="nouveauMotDePasse" @input="nouveauMotDePasse = $event.target.value">
						<label for="champ-confirmation-motdepasse">{{ $t('confirmationNouveauMotDePasse') }}</label>
						<input id="champ-confirmation-motdepasse" type="password" maxlength="48" :value="confirmationNouveauMotDePasse" @input="confirmationNouveauMotDePasse = $event.target.value" @keydown.enter="modifierMotDePasse">
						<div class="actions">
							<span role="button" tabindex="0" class="bouton" @click="modifierMotDePasse">{{ $t('modifier') }}</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="conteneur-modale" v-if="modaleCreerPad">
			<div id="creation" class="modale">
				<div class="en-tete">
					<span class="titre">{{ $t('creerPad') }}</span>
					<span role="button" class="fermer" @click="fermerModaleCreerPad"><i class="material-icons">close</i></span>
				</div>
				<div class="conteneur">
					<div class="contenu">
						<label for="champ-titre-pad">{{ $t('titrePad') }}</label>
						<input id="champ-titre-pad" type="text" maxlength="48" :value="titre" @input="titre = $event.target.value" @keydown.enter="creerPad">
						<div class="actions">
							<span role="button" tabindex="0" class="bouton" @click="creerPad">{{ $t('creer') }}</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="conteneur-modale" v-else-if="modaleDeplacerPad">
			<div id="creation" class="modale">
				<div class="en-tete">
					<span class="titre">{{ $t('ajouterDansDossier') }}</span>
					<span role="button" class="fermer" @click="fermerModaleDeplacerPad"><i class="material-icons">close</i></span>
				</div>
				<div class="conteneur">
					<div class="contenu">
						<label for="champ-dossier-actuel">{{ $t('dossierActuel') }}</label>
						<input type="text" :value="$t('aucunDossier')" disabled v-if="dossierActuel.id === 'aucun'">
						<input type="text" :value="dossierActuel.nom" disabled v-else>
						<label for="champ-dossier-pad">{{ $t('dossierDestination') }}</label>
						<select id="champ-dossier-pad">
							<option value="aucun" v-if="dossierActuel.id !== 'aucun'">{{ $t('aucunDossier') }}</option>
							<template v-for="(item, indexItem) in dossiers">
								<option :value="item.id" v-if="dossierActuel.id !== item.id" :key="'dossier_' + indexItem">{{ item.nom }}</option>
							</template>
						</select>
						<div class="actions">
							<span role="button" tabindex="0" class="bouton" @click="deplacerPad">{{ $t('valider') }}</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="conteneur-modale" v-else-if="modaleImporterPad">
			<div id="import" class="modale">
				<div class="en-tete">
					<span class="titre">{{ $t('importerPad') }}</span>
					<span role="button" tabindex="0" class="fermer" @click="fermerModaleImporterPad"><i class="material-icons">close</i></span>
				</div>
				<div class="conteneur">
					<div class="contenu">
						<div class="conteneur-interrupteur" v-if="progressionImport === 0">
							<span>{{ $t('importerCommentaires') }}</span>
							<label class="bouton-interrupteur">
								<input type="checkbox" :checked="parametresImport.commentaires" @change="modifierParametresImport($event, 'commentaires')">
								<span class="barre" />
							</label>
						</div>
						<div class="conteneur-interrupteur" v-if="progressionImport === 0">
							<span>{{ $t('importerEvaluations') }}</span>
							<label class="bouton-interrupteur">
								<input type="checkbox" :checked="parametresImport.evaluations" @change="modifierParametresImport($event, 'evaluations')">
								<span class="barre" />
							</label>
						</div>
						<div class="conteneur-interrupteur" v-if="progressionImport === 0">
							<span>{{ $t('importerActivite') }}</span>
							<label class="bouton-interrupteur">
								<input type="checkbox" :checked="parametresImport.activite" @change="modifierParametresImport($event, 'activite')">
								<span class="barre" />
							</label>
						</div>
						<label for="importer-pad" class="bouton" v-show="progressionImport === 0">{{ $t('selectionnerPad') }}</label>
						<input id="importer-pad" type="file" style="display: none" accept=".zip" @change="importerPad">
						<div class="conteneur-chargement progression" v-if="progressionImport > 0">
							<progress class="barre-progression" max="100" :value="progressionImport" />
							<div class="chargement" />
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="conteneur-modale" v-else-if="modaleAjouterDossier">
			<div id="ajout-dossier" class="modale">
				<div class="en-tete">
					<span class="titre">{{ $t('ajouterDossier') }}</span>
					<span role="button" class="fermer" @click="fermerModaleAjouterDossier"><i class="material-icons">close</i></span>
				</div>
				<div class="conteneur">
					<div class="contenu">
						<label for="champ-nom-dossier">{{ $t('nomDossier') }}</label>
						<input id="champ-nom-dossier" type="text" maxlength="48" :value="dossier" @input="dossier = $event.target.value" @keydown.enter="ajouterDossier">
						<div class="actions">
							<span role="button" tabindex="0" class="bouton" @click="ajouterDossier">{{ $t('valider') }}</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="conteneur-modale" v-else-if="modaleModifierDossier">
			<div id="modification-dossier" class="modale">
				<div class="en-tete">
					<span class="titre">{{ $t('modifierDossier') }}</span>
					<span role="button" class="fermer" @click="fermerModaleModifierDossier"><i class="material-icons">close</i></span>
				</div>
				<div class="conteneur">
					<div class="contenu">
						<label for="champ-nom-dossier">{{ $t('nomDossier') }}</label>
						<input id="champ-nom-dossier" type="text" maxlength="48" :value="dossier" @input="dossier = $event.target.value" @keydown.enter="modifierDossier">
						<div class="actions">
							<span role="button" tabindex="0" class="bouton" @click="modifierDossier">{{ $t('valider') }}</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="conteneur-modale alerte" v-if="modaleConfirmation !== ''">
			<div class="modale">
				<div class="conteneur">
					<div class="contenu">
						<div class="message" v-html="$t('confirmationDupliquerPad')" v-if="modaleConfirmation === 'dupliquer'" />
						<div class="message" v-html="$t('confirmationExporterPad')" v-else-if="modaleConfirmation === 'exporter'" />
						<div class="message" v-html="$t('confirmationSupprimerPad')" v-else-if="modaleConfirmation === 'supprimer'" />
						<div class="message" v-html="$t('confirmationSupprimerPadAdmin')" v-else-if="modaleConfirmation === 'supprimer-admin'" />
						<div class="message" v-html="$t('confirmationSupprimerCompte')" v-else-if="modaleConfirmation === 'supprimer-compte'" />
						<div class="message" v-html="$t('confirmationSupprimerDossier')" v-else-if="modaleConfirmation === 'supprimer-dossier'" />
						<div class="actions">
							<span role="button" tabindex="0" class="bouton" @click="fermerModaleConfirmation">{{ $t('non') }}</span>
							<span role="button" tabindex="0" class="bouton" @click="dupliquerPad" v-if="modaleConfirmation === 'dupliquer'">{{ $t('oui') }}</span>
							<span role="button" tabindex="0" class="bouton" @click="exporterPad" v-else-if="modaleConfirmation === 'exporter'">{{ $t('oui') }}</span>
							<span role="button" tabindex="0" class="bouton" @click="supprimerPad" v-else-if="modaleConfirmation === 'supprimer'">{{ $t('oui') }}</span>
							<span role="button" tabindex="0" class="bouton" @click="supprimerPad" v-else-if="modaleConfirmation === 'supprimer-admin'">{{ $t('oui') }}</span>
							<span role="button" tabindex="0" class="bouton" @click="supprimerCompte" v-else-if="modaleConfirmation === 'supprimer-compte'">{{ $t('oui') }}</span>
							<span role="button" tabindex="0" class="bouton" @click="supprimerDossier" v-else-if="modaleConfirmation === 'supprimer-dossier'">{{ $t('oui') }}</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Barre d'actions pour la sélection multiple -->
		<div class="selection-action-bar" v-if="selectionMode && selectedPads.length > 0">
			<div class="selection-info">
				<span class="count">{{ selectedPads.length }} pad{{ selectedPads.length > 1 ? 's' : '' }} sélectionné{{ selectedPads.length > 1 ? 's' : '' }}</span>
			</div>
			<div class="selection-actions">
				<button class="action-btn select-all" @click="selectAllPads" :title="selectedPads.length === pads.length ? 'Tout désélectionner' : 'Tout sélectionner'">
					<i class="material-icons">{{ selectedPads.length === pads.length ? 'check_box' : 'check_box_outline_blank' }}</i>
					<span>{{ selectedPads.length === pads.length ? 'Désélect.' : 'Tout' }}</span>
				</button>
				<button class="action-btn favorite" @click="addSelectedToFavorites" title="Ajouter aux favoris">
					<i class="material-icons">star</i>
					<span>Favoris</span>
				</button>
				<button class="action-btn folder" @click="showMoveToFolderModal" v-if="dossiers.length > 0" title="Déplacer vers un dossier">
					<i class="material-icons">drive_file_move</i>
					<span>Dossier</span>
				</button>
				<button class="action-btn classroom" @click="shareSelectedToClassroom" title="Partager vers Google Classroom">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z" fill="currentColor"/>
						<path d="M12 7C10.9 7 10 7.9 10 9C10 10.1 10.9 11 12 11C13.1 11 14 10.1 14 9C14 7.9 13.1 7 12 7Z" fill="currentColor"/>
						<path d="M12 13C9.33 13 7 14.34 7 16V17H17V16C17 14.34 14.67 13 12 13Z" fill="currentColor"/>
					</svg>
					<span>Classroom</span>
				</button>
				<button class="action-btn delete" @click="confirmDeleteSelected" title="Supprimer les pads sélectionnés">
					<i class="material-icons">delete</i>
					<span>Supprimer</span>
				</button>
				<button class="action-btn cancel" @click="cancelSelection" title="Annuler la sélection">
					<i class="material-icons">close</i>
					<span>Annuler</span>
				</button>
			</div>
		</div>

		<!-- Modal de confirmation de suppression multiple -->
		<div class="conteneur-modale alerte" v-if="showDeleteConfirmModal">
			<div class="modale">
				<div class="conteneur">
					<div class="contenu">
						<div class="message">
							<strong>Supprimer {{ selectedPads.length }} pad{{ selectedPads.length > 1 ? 's' : '' }} ?</strong><br><br>
							Cette action est irréversible.
						</div>
						<div class="actions">
							<span role="button" tabindex="0" class="bouton" @click="showDeleteConfirmModal = false">Non</span>
							<span role="button" tabindex="0" class="bouton bouton-danger" @click="deleteSelectedPads">Oui, supprimer</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Modal de déplacement vers dossier multiple -->
		<div class="conteneur-modale" v-if="showMoveMultipleModal">
			<div id="creation" class="modale">
				<div class="en-tete">
					<span class="titre">Déplacer {{ selectedPads.length }} pad{{ selectedPads.length > 1 ? 's' : '' }}</span>
					<span role="button" class="fermer" @click="showMoveMultipleModal = false"><i class="material-icons">close</i></span>
				</div>
				<div class="conteneur">
					<div class="contenu">
						<label>Choisir un dossier :</label>
						<select id="champ-dossier-multiple" v-model="selectedFolderForMove">
							<option value="aucun">Aucun dossier</option>
							<option v-for="(item, indexItem) in dossiers" :value="item.id" :key="'dossier_move_' + indexItem">{{ item.nom }}</option>
						</select>
						<div class="actions">
							<span role="button" tabindex="0" class="bouton" @click="moveSelectedToFolder">Déplacer</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Modal de partage rapide vers Google Classroom -->
		<QuickShareModal
			v-if="showQuickShareModal"
			:pads="selectedPads"
			@close="showQuickShareModal = false"
			@pad-shared="onPadShared"
			@shared="onQuickShareComplete"
		/>

		<chargement :chargement="chargement" v-if="chargement" />
	</main>
</template>

<script>
import axios from 'axios'
import imagesLoaded from 'imagesloaded'
import saveAs from 'file-saver'
import chargement from '../../components/chargement.vue'
import ClassroomManager from '../../components/ClassroomManager.vue'
import QuickShareModal from '../../components/QuickShareModal.vue'

export default {
	name: 'Utilisateur',
	components: {
		chargement,
		ClassroomManager,
		QuickShareModal
	},
	async asyncData (context) {
		const { data } = await axios.post(context.store.state.hote + '/api/recuperer-donnees-utilisateur', {
			identifiant: context.store.state.identifiant
		}, {
			headers: { 'Content-Type': 'application/json' }
		})
		return {
			padsCrees: data.padsCrees,
			padsRejoints: data.padsRejoints,
			padsAdmins: data.padsAdmins,
			padsFavoris: data.padsFavoris,
			dossiers: data.dossiers
		}
	},
	data () {
		return {
			chargement: false,
			onglet: 'pads-crees',
			titre: '',
			menu: false,
			modaleCreerPad: false,
			modaleImporterPad: false,
			progressionImport: 0,
			modaleConfirmation: '',
			padId: '',
			modaleMotDePasse: false,
			motDePasse: '',
			nouveauMotDePasse: '',
			confirmationNouveauMotDePasse: '',
			pads: [],
			requete: '',
			resultats: [],
			favoris: [],
			parametresImport: {
				commentaires: false,
				evaluations: false,
				activite: false
			},
			modaleAjouterDossier: false,
			modaleModifierDossier: false,
			dossier: '',
			dossierId: '',
			modaleDeplacerPad: false,
			dossierActuel: {},
			// Mode sélection multiple
			selectionMode: false,
			selectedPads: [],
			showClassroomShareModal: false,
			showQuickShareModal: false,
			classroomClasses: [],
			loadingClasses: false,
			// Modales pour actions multiples
			showDeleteConfirmModal: false,
			showMoveMultipleModal: false,
			selectedFolderForMove: 'aucun'
		}
	},
	head () {
		return {
			title: this.identifiant + ' - Digipad by La Digitale'
		}
	},
	computed: {
		hote () {
			return this.$store.state.hote
		},
		identifiant () {
			return this.$store.state.identifiant
		},
		nom () {
			return this.$store.state.nom
		},
		email () {
			return this.$store.state.email
		},
		langue () {
			return this.$store.state.langue
		},
		statut () {
			return this.$store.state.statut
		},
		affichage () {
			return this.$store.state.affichage
		},
		filtre () {
			return this.$store.state.filtre
		},
		limite () {
			return process.env.padLimit
		}
	},
	watch: {
		onglet: function (onglet) {
			let pads = []
			if (onglet === 'pads-crees') {
				pads = this.padsCrees
			} else if (onglet === 'pads-rejoints') {
				pads = this.padsRejoints
			} else if (onglet === 'pads-admins') {
				pads = this.padsAdmins
			} else if (onglet === 'pads-favoris') {
				pads = this.padsFavoris
			} else {
				let listePads = []
				this.dossiers.forEach(function (dossier) {
					if (dossier.id === onglet) {
						listePads = dossier.pads
					}
				})
				const padsTous = this.padsCrees.concat(this.padsRejoints, this.padsAdmins)
				padsTous.forEach(function (pad) {
					if (listePads.includes(pad.id)) {
						pads.push(pad)
					}
				})
			}
			this.pads = pads
			this.requete = ''
		},
		requete: function () {
			this.rechercher()
		}
	},
	watchQuery: ['page'],
	created () {
		if (this.identifiant === '' || this.statut === 'invite') {
			this.$router.push('/')
		}
		this.pads = this.padsCrees
		const favoris = []
		this.padsFavoris.forEach(function (pad) {
			favoris.push(pad.id)
		})
		this.favoris = favoris
		this.filtrer(this.filtre)
		this.$nuxt.$loading.start()
		this.$i18n.setLocale(this.langue)
	},
	mounted () {
		imagesLoaded('#pads', { background: true }, function () {
			setTimeout(function () {
				this.$nuxt.$loading.finish()
				document.getElementsByTagName('html')[0].setAttribute('lang', this.langue)
			}.bind(this), 100)
		}.bind(this))
	},
	methods: {
		getGoogleClassrooms (pad) {
			// Nouvelle structure : tableau de classes avec couleurs
			if (pad.googleClassrooms) {
				try {
					return JSON.parse(pad.googleClassrooms)
				} catch (e) {
					return []
				}
			}
			// Rétrocompatibilité : ancienne structure avec un seul nom
			if (pad.googleClassroom) {
				return [{ name: pad.googleClassroom, color: '#1967D2' }]
			}
			return []
		},
		definirFond (fond) {
			// Remplacer les anciens fonds moches par des gradients modernes
			const oldFondsToGradients = {
				'/img/fond1.png': 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
				'/img/fond2.png': 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
				'/img/fond3.png': 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
				'/img/fond4.png': 'linear-gradient(135deg, #14b8a6 0%, #2dd4bf 100%)',
				'/img/fond5.png': 'linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)',
				'/img/fond6.png': 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
				'/img/fond7.png': 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
				'/img/fond8.png': 'linear-gradient(135deg, #84cc16 0%, #a3e635 100%)',
				'/img/fond9.png': 'linear-gradient(135deg, #eab308 0%, #facc15 100%)',
				'/img/fond10.png': 'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)',
				'/img/fond11.png': 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)'
			}

			if (oldFondsToGradients[fond]) {
				return { background: oldFondsToGradients[fond] }
			}

			if (fond.substring(0, 1) === '#') {
				// Transformer les couleurs plates en gradients modernes
				const gradients = {
					'#001d1d': 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
					'#ff6259': 'linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)',
					'#ffce00': 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
					'#00ced1': 'linear-gradient(135deg, #0891b2 0%, #22d3d8 100%)',
					'#0891b2': 'linear-gradient(135deg, #0891b2 0%, #22d3d8 100%)',
					'#e32f6c': 'linear-gradient(135deg, #db2777 0%, #f472b6 100%)',
					// Couleurs Google Classroom
					'#1967D2': 'linear-gradient(135deg, #1967D2 0%, #4285f4 100%)', // Bleu Google
					'#1E8E3E': 'linear-gradient(135deg, #1E8E3E 0%, #34a853 100%)', // Vert
					'#E8710A': 'linear-gradient(135deg, #E8710A 0%, #fbbc04 100%)', // Orange
					'#D93025': 'linear-gradient(135deg, #D93025 0%, #ea4335 100%)', // Rouge
					'#9334E6': 'linear-gradient(135deg, #9334E6 0%, #a855f7 100%)', // Violet
					'#12B5CB': 'linear-gradient(135deg, #12B5CB 0%, #22d3ee 100%)', // Cyan
					'#E52592': 'linear-gradient(135deg, #E52592 0%, #ec4899 100%)', // Rose
					'#F9AB00': 'linear-gradient(135deg, #F9AB00 0%, #fbbf24 100%)', // Jaune
					'#1A73E8': 'linear-gradient(135deg, #1A73E8 0%, #60a5fa 100%)', // Bleu clair
					'#34A853': 'linear-gradient(135deg, #34A853 0%, #4ade80 100%)', // Vert clair
					'#EA8600': 'linear-gradient(135deg, #EA8600 0%, #fbbf24 100%)', // Orange clair
					'#C5221F': 'linear-gradient(135deg, #C5221F 0%, #f87171 100%)' // Rouge foncé
				}
				if (gradients[fond]) {
					return { background: gradients[fond] }
				}
				// Creer un gradient subtil a partir de la couleur
				return { background: `linear-gradient(135deg, ${fond} 0%, ${this.lightenColor(fond, 15)} 100%)` }
			} else {
				return { backgroundImage: 'url(' + fond + ')' }
			}
		},
		lightenColor (hex, percent) {
			// Convertir hex en RGB et eclaircir
			const num = parseInt(hex.replace('#', ''), 16)
			const amt = Math.round(2.55 * percent)
			const R = Math.min(255, (num >> 16) + amt)
			const G = Math.min(255, ((num >> 8) & 0x00FF) + amt)
			const B = Math.min(255, (num & 0x0000FF) + amt)
			return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)
		},
		afficherModaleCreerPad () {
			if (this.padsCrees.length < this.limite) {
				this.modaleCreerPad = true
				this.$nextTick(function () {
					document.querySelector('#creation input').focus()
				})
			} else {
				this.$store.dispatch('modifierAlerte', this.$t('limitePad', { limite: this.limite }))
			}
		},
		creerPad () {
			if (this.titre !== '') {
				axios.post(this.hote + '/api/creer-pad', {
					titre: this.titre,
					identifiant: this.identifiant
				}).then(function (reponse) {
					const donnees = reponse.data
					if (donnees === 'non_connecte') {
						this.$router.push('/')
					} else if (donnees === 'erreur_creation') {
						this.$store.dispatch('modifierAlerte', this.$t('erreurCreationPad'))
					} else {
						this.padsCrees.push(donnees)
						this.$router.push('/p/' + donnees.id + '/' + donnees.token)
					}
				}.bind(this)).catch(function () {
					this.$store.dispatch('modifierAlerte', this.$t('erreurCommunicationServeur'))
				}.bind(this))
			}
		},
		fermerModaleCreerPad () {
			this.modaleCreerPad = false
			this.titre = ''
		},
		onNewPadCreated (pad) {
			// Ajouter le nouveau pad à la liste des pads créés
			if (pad && pad.id) {
				this.padsCrees.push(pad)
			}
		},
		onPadShared (shareInfo) {
			// Mettre à jour le pad localement avec les infos de la classe partagée
			const { padId, courseId, courseName, courseColor } = shareInfo

			// Chercher le pad dans padsCrees
			const pad = this.padsCrees.find(p => p.id === padId)
			if (pad) {
				// Parser les classes existantes ou créer un tableau vide
				let classrooms = []
				if (pad.googleClassrooms) {
					try {
						classrooms = JSON.parse(pad.googleClassrooms)
					} catch (e) {
						classrooms = []
					}
				} else if (pad.googleClassroom) {
					// Rétrocompatibilité : convertir l'ancienne structure
					classrooms = [{ name: pad.googleClassroom, color: '#1967D2' }]
				}

				// Ajouter la nouvelle classe si elle n'existe pas déjà
				const alreadyAdded = classrooms.some(c => c.courseId === courseId)
				if (!alreadyAdded) {
					classrooms.push({
						courseId: courseId,
						name: courseName,
						color: courseColor || '#1967D2'
					})
				}

				// Mettre à jour le pad localement
				this.$set(pad, 'googleClassrooms', JSON.stringify(classrooms))
				this.$set(pad, 'googleClassroom', courseName) // Rétrocompatibilité
			}
		},
		onQuickShareComplete (shareResult) {
			// Fermer le modal et désactiver le mode sélection
			this.showQuickShareModal = false
			this.selectionMode = false
			this.selectedPads = []

			// Afficher un message de confirmation
			const count = shareResult.count || 0
			const classesCount = shareResult.classes?.length || 0
			if (count > 0) {
				this.$store.commit('modifierNotification', {
					type: 'reussite',
					message: `${count} pad(s) partagé(s) vers ${classesCount} classe(s)`
				})
			}
		},
		// Méthodes pour la sélection multiple
		toggleSelectionMode () {
			this.selectionMode = !this.selectionMode
			if (!this.selectionMode) {
				this.selectedPads = []
			}
		},
		isPadSelected (padId) {
			return this.selectedPads.some(p => p.id === padId)
		},
		togglePadSelection (pad) {
			const index = this.selectedPads.findIndex(p => p.id === pad.id)
			if (index === -1) {
				this.selectedPads.push(pad)
			} else {
				this.selectedPads.splice(index, 1)
			}
		},
		navigateToPad (pad) {
			this.$router.push('/p/' + pad.id + '/' + pad.token)
		},
		selectAllPads () {
			if (this.selectedPads.length === this.pads.length) {
				this.selectedPads = []
			} else {
				this.selectedPads = [...this.pads]
			}
		},
		cancelSelection () {
			this.selectionMode = false
			this.selectedPads = []
		},
		shareSelectedToClassroom () {
			// Ouvrir le modal de partage rapide
			this.showQuickShareModal = true
		},
		// Actions multiples
		addSelectedToFavorites () {
			const padsToAdd = this.selectedPads.filter(pad => !this.favoris.includes(pad.id))
			if (padsToAdd.length === 0) {
				this.$store.dispatch('modifierMessage', 'Tous les pads sélectionnés sont déjà en favoris')
				return
			}
			padsToAdd.forEach((pad) => {
				this.ajouterFavori(pad)
			})
			this.$store.dispatch('modifierMessage', `${padsToAdd.length} pad${padsToAdd.length > 1 ? 's ajoutés' : ' ajouté'} aux favoris`)
			this.cancelSelection()
		},
		showMoveToFolderModal () {
			this.selectedFolderForMove = 'aucun'
			this.showMoveMultipleModal = true
		},
		moveSelectedToFolder () {
			const dossierId = this.selectedFolderForMove
			const padsToMove = this.selectedPads.filter(pad => pad.identifiant === this.identifiant)

			if (padsToMove.length === 0) {
				this.$store.dispatch('modifierAlerte', 'Vous ne pouvez déplacer que vos propres pads')
				return
			}

			// Retirer les pads des dossiers existants
			this.dossiers.forEach((dossier) => {
				padsToMove.forEach((pad) => {
					const index = dossier.pads.indexOf(pad.id)
					if (index > -1) {
						dossier.pads.splice(index, 1)
					}
				})
			})

			// Ajouter au nouveau dossier si ce n'est pas "aucun"
			if (dossierId !== 'aucun') {
				const dossierCible = this.dossiers.find(d => d.id === dossierId)
				if (dossierCible) {
					padsToMove.forEach((pad) => {
						if (!dossierCible.pads.includes(pad.id)) {
							dossierCible.pads.push(pad.id)
						}
					})
				}
			}

			// Sauvegarder les dossiers
			axios.post(this.hote + '/api/modifier-dossiers', {
				identifiant: this.identifiant,
				dossiers: JSON.stringify(this.dossiers)
			}).then(() => {
				const message = dossierId === 'aucun'
					? `${padsToMove.length} pad${padsToMove.length > 1 ? 's retirés' : ' retiré'} des dossiers`
					: `${padsToMove.length} pad${padsToMove.length > 1 ? 's déplacés' : ' déplacé'}`
				this.$store.dispatch('modifierMessage', message)
			}).catch(() => {
				this.$store.dispatch('modifierAlerte', 'Erreur lors du déplacement')
			})

			this.showMoveMultipleModal = false
			this.cancelSelection()
		},
		confirmDeleteSelected () {
			// Vérifier que l'utilisateur possède les pads
			const ownedPads = this.selectedPads.filter(pad => pad.identifiant === this.identifiant)
			if (ownedPads.length === 0) {
				this.$store.dispatch('modifierAlerte', 'Vous ne pouvez supprimer que vos propres pads')
				return
			}
			if (ownedPads.length < this.selectedPads.length) {
				this.$store.dispatch('modifierAlerte', `Seuls ${ownedPads.length} pad${ownedPads.length > 1 ? 's vous appartenant seront supprimés' : ' vous appartenant sera supprimé'}`)
			}
			this.showDeleteConfirmModal = true
		},
		deleteSelectedPads () {
			const padsToDelete = this.selectedPads.filter(pad => pad.identifiant === this.identifiant)
			let deleted = 0

			padsToDelete.forEach((pad) => {
				axios.post(this.hote + '/api/supprimer-pad', {
					padId: pad.id,
					identifiant: this.identifiant
				}).then(() => {
					// Retirer de la liste des pads créés
					const index = this.padsCrees.findIndex(p => p.id === pad.id)
					if (index > -1) {
						this.padsCrees.splice(index, 1)
					}
					// Retirer des dossiers
					this.dossiers.forEach((dossier) => {
						const dossierIndex = dossier.pads.indexOf(pad.id)
						if (dossierIndex > -1) {
							dossier.pads.splice(dossierIndex, 1)
						}
					})
					// Retirer des favoris
					const favIndex = this.favoris.indexOf(pad.id)
					if (favIndex > -1) {
						this.favoris.splice(favIndex, 1)
					}
					deleted++
					if (deleted === padsToDelete.length) {
						this.$store.dispatch('modifierMessage', `${deleted} pad${deleted > 1 ? 's supprimés' : ' supprimé'}`)
					}
				}).catch(() => {
					this.$store.dispatch('modifierAlerte', 'Erreur lors de la suppression')
				})
			})

			this.showDeleteConfirmModal = false
			this.cancelSelection()
		},
		afficherModaleImporterPad () {
			if (this.padsCrees.length < this.limite) {
				this.modaleImporterPad = true
			} else {
				this.$store.dispatch('modifierAlerte', this.$t('limitePad', { limite: this.limite }))
			}
		},
		modifierParametresImport (event, type) {
			this.parametresImport[type] = event.target.checked
		},
		importerPad () {
			const champ = document.querySelector('#importer-pad')
			const extension = champ.files[0].name.substring(champ.files[0].name.lastIndexOf('.') + 1).toLowerCase()
			if (champ.files && champ.files[0] && extension === 'zip') {
				const formulaire = new FormData()
				formulaire.append('parametres', JSON.stringify(this.parametresImport))
				formulaire.append('fichier', champ.files[0])
				axios.post(this.hote + '/api/importer-pad', formulaire, {
					headers: {
						'Content-Type': 'multipart/form-data'
					},
					onUploadProgress: function (progression) {
						const pourcentage = parseInt(Math.round((progression.loaded * 100) / progression.total))
						this.progressionImport = pourcentage
					}.bind(this)
				}).then(function (reponse) {
					this.fermerModaleImporterPad()
					const donnees = reponse.data
					if (donnees === 'non_connecte') {
						this.$router.push('/')
					} else if (donnees === 'erreur_import') {
						this.$store.dispatch('modifierAlerte', this.$t('erreurImportPad'))
					} else if (donnees === 'donnees_corrompues') {
						this.$store.dispatch('modifierAlerte', this.$t('donneesCorrompuesImportPad'))
					} else {
						this.onglet = 'pads-crees'
						this.padsCrees.push(donnees)
						this.$store.dispatch('modifierMessage', this.$t('padImporte'))
					}
				}.bind(this)).catch(function () {
					this.fermerModaleImporterPad()
					this.$store.dispatch('modifierAlerte', this.$t('erreurCommunicationServeur'))
				}.bind(this))
			} else {
				this.$store.dispatch('modifierAlerte', this.$t('formatFichierPasAccepte'))
				champ.value = ''
			}
		},
		fermerModaleImporterPad () {
			this.modaleImporterPad = false
			this.parametresImport.commentaires = false
			this.parametresImport.evaluations = false
			this.parametresImport.activite = false
			this.progressionImport = 0
			document.querySelector('#importer-pad').value = ''
		},
		afficherModaleConfirmation (event, id, type) {
			event.preventDefault()
			event.stopPropagation()
			if (type === 'supprimer-compte') {
				this.menu = false
			} else if (type === 'supprimer-dossier') {
				this.dossierId = id
			} else {
				this.padId = id
			}
			this.modaleConfirmation = type
		},
		fermerModaleConfirmation () {
			this.modaleConfirmation = ''
			this.padId = ''
			this.dossierId = ''
		},
		ajouterFavori (pad) {
			this.chargement = true
			axios.post(this.hote + '/api/ajouter-pad-favoris', {
				padId: pad.id,
				identifiant: this.identifiant
			}).then(function (reponse) {
				this.chargement = false
				const donnees = reponse.data
				if (donnees === 'non_connecte') {
					this.$router.push('/')
				} else if (donnees === 'erreur_ajout_favori') {
					this.$store.dispatch('modifierAlerte', this.$t('erreurAjoutFavoris'))
				} else {
					this.padsFavoris.push(pad)
					this.favoris.push(pad.id)
					this.$store.dispatch('modifierMessage', this.$t('padAjouteFavoris'))
				}
			}.bind(this)).catch(function () {
				this.chargement = false
				this.$store.dispatch('modifierAlerte', this.$t('erreurCommunicationServeur'))
			}.bind(this))
		},
		supprimerFavori (padId) {
			this.chargement = true
			axios.post(this.hote + '/api/supprimer-pad-favoris', {
				padId: padId,
				identifiant: this.identifiant
			}).then(function (reponse) {
				this.chargement = false
				const donnees = reponse.data
				if (donnees === 'non_connecte') {
					this.$router.push('/')
				} else if (donnees === 'erreur_suppression_favori') {
					this.$store.dispatch('modifierAlerte', this.$t('erreurSuppressionFavoris'))
				} else {
					this.padsFavoris.forEach(function (pad, indexPad) {
						if (pad.id === padId) {
							this.padsFavoris.splice(indexPad, 1)
						}
					}.bind(this))
					this.favoris.forEach(function (favori, indexFavori) {
						if (favori === padId) {
							this.favoris.splice(indexFavori, 1)
						}
					}.bind(this))
					this.$store.dispatch('modifierMessage', this.$t('padSupprimeFavoris'))
				}
			}.bind(this)).catch(function () {
				this.chargement = false
				this.$store.dispatch('modifierAlerte', this.$t('erreurCommunicationServeur'))
			}.bind(this))
		},
		verifierDossierPad (padId) {
			let padDansDossier = false
			this.dossiers.forEach(function (dossier) {
				if (dossier.pads.includes(padId)) {
					padDansDossier = true
				}
			})
			return padDansDossier
		},
		afficherModaleDeplacerPad (padId) {
			this.padId = padId
			let dossierActuel = { id: 'aucun', nom: '' }
			this.dossiers.forEach(function (dossier) {
				if (dossier.pads.includes(this.padId)) {
					dossierActuel = { id: dossier.id, nom: dossier.nom }
				}
			}.bind(this))
			this.dossierActuel = dossierActuel
			this.modaleDeplacerPad = true
		},
		deplacerPad () {
			const destination = document.querySelector('#champ-dossier-pad').value
			if (destination !== this.dossierActuel.id) {
				this.chargement = true
				this.modaleDeplacerPad = false
				axios.post(this.hote + '/api/deplacer-pad', {
					padId: this.padId,
					destination: destination,
					identifiant: this.identifiant
				}).then(function (reponse) {
					this.chargement = false
					const donnees = reponse.data
					if (donnees === 'non_connecte') {
						this.$router.push('/')
					} else if (donnees === 'erreur_deplacement') {
						this.$store.dispatch('modifierAlerte', this.$t('erreurDeplacementPad'))
					} else {
						this.dossiers.forEach(function (dossier, indexDossier) {
							if (dossier.pads.includes(this.padId)) {
								const indexPad = dossier.pads.indexOf(this.padId)
								this.dossiers[indexDossier].pads.splice(indexPad, 1)
							}
							if (dossier.id === destination) {
								this.dossiers[indexDossier].pads.push(this.padId)
							}
						}.bind(this))
						if (this.onglet === this.dossierActuel.id) {
							this.pads.forEach(function (pad, indexPad) {
								if (pad.id === this.padId) {
									this.pads.splice(indexPad, 1)
								}
							}.bind(this))
						}
						this.$store.dispatch('modifierMessage', this.$t('padDeplace'))
						this.fermerModaleDeplacerPad()
					}
				}.bind(this)).catch(function () {
					this.chargement = false
					this.fermerModaleDeplacerPad()
					this.$store.dispatch('modifierAlerte', this.$t('erreurCommunicationServeur'))
				}.bind(this))
			}
		},
		fermerModaleDeplacerPad () {
			this.modaleDeplacerPad = false
			this.padId = ''
			this.dossierActuel = {}
		},
		dupliquerPad () {
			this.modaleConfirmation = ''
			this.chargement = true
			axios.post(this.hote + '/api/dupliquer-pad', {
				padId: this.padId,
				identifiant: this.identifiant
			}).then(function (reponse) {
				this.chargement = false
				const donnees = reponse.data
				if (donnees === 'non_connecte') {
					this.$router.push('/')
				} else if (donnees === 'erreur_duplication') {
					this.$store.dispatch('modifierAlerte', this.$t('erreurDuplicationPad'))
				} else {
					this.padsCrees.push(donnees)
					this.$store.dispatch('modifierMessage', this.$t('padDuplique'))
					this.padId = ''
					this.onglet = 'pads-crees'
				}
			}.bind(this)).catch(function () {
				this.chargement = false
				this.padId = ''
				this.$store.dispatch('modifierAlerte', this.$t('erreurCommunicationServeur'))
			}.bind(this))
		},
		exporterPad () {
			this.modaleConfirmation = ''
			this.chargement = true
			axios.post(this.hote + '/api/exporter-pad', {
				padId: this.padId,
				identifiant: this.identifiant
			}).then(function (reponse) {
				this.chargement = false
				const donnees = reponse.data
				if (donnees === 'non_connecte') {
					this.$router.push('/')
				} else if (donnees === 'erreur_export') {
					this.$store.dispatch('modifierAlerte', this.$t('erreurExportPad'))
				} else {
					saveAs('/temp/' + donnees, 'pad-' + this.padId + '.zip')
				}
				this.padId = ''
			}.bind(this)).catch(function () {
				this.chargement = false
				this.padId = ''
				this.$store.dispatch('modifierAlerte', this.$t('erreurCommunicationServeur'))
			}.bind(this))
		},
		supprimerPad () {
			this.modaleConfirmation = ''
			this.chargement = true
			const type = this.definirTypePad(this.padId)
			axios.post(this.hote + '/api/supprimer-pad', {
				padId: this.padId,
				type: type,
				identifiant: this.identifiant
			}).then(function (reponse) {
				this.chargement = false
				const donnees = reponse.data
				if (donnees === 'non_connecte') {
					this.$router.push('/')
				} else if (donnees === 'erreur_suppression') {
					this.$store.dispatch('modifierAlerte', this.$t('erreurSuppressionPad'))
				} else {
					this.padsCrees.forEach(function (pad, index) {
						if (pad.id === this.padId) {
							this.padsCrees.splice(index, 1)
						}
					}.bind(this))
					this.padsRejoints.forEach(function (pad, index) {
						if (pad.id === this.padId) {
							this.padsRejoints.splice(index, 1)
						}
					}.bind(this))
					this.padsAdmins.forEach(function (pad, index) {
						if (pad.id === this.padId) {
							this.padsAdmins.splice(index, 1)
						}
					}.bind(this))
					this.padsFavoris.forEach(function (pad, index) {
						if (pad.id === this.padId) {
							this.padsFavoris.splice(index, 1)
						}
					}.bind(this))
					this.favoris.forEach(function (favori, index) {
						if (favori === this.padId) {
							this.favoris.splice(index, 1)
						}
					}.bind(this))
					this.pads.forEach(function (pad, index) {
						if (pad.id === this.padId) {
							this.pads.splice(index, 1)
						}
					}.bind(this))
					this.dossiers.forEach(function (dossier, indexDossier) {
						if (dossier.pads.includes(this.padId)) {
							const indexPad = dossier.pads.indexOf(this.padId)
							this.dossiers[indexDossier].pads.splice(indexPad, 1)
						}
					}.bind(this))
					this.$store.dispatch('modifierMessage', this.$t('padSupprime'))
					this.padId = ''
				}
			}.bind(this)).catch(function () {
				this.chargement = false
				this.padId = ''
				this.$store.dispatch('modifierAlerte', this.$t('erreurCommunicationServeur'))
			}.bind(this))
		},
		definirTypePad (padId) {
			let type = ''
			this.padsRejoints.forEach(function (pad) {
				if (pad.id === padId) {
					type = 'pad-rejoint'
				}
			})
			this.padsAdmins.forEach(function (pad) {
				if (pad.id === padId) {
					type = 'pad-admin'
				}
			})
			return type
		},
		rechercher () {
			let resultats = []
			if (this.requete === '!maj') {
				resultats = this.pads.filter(function (element) {
					return element.notification && element.notification.includes(this.identifiant)
				}.bind(this))
			} else {
				resultats = this.pads.filter(function (element) {
					return element.titre.toLowerCase().includes(this.requete.toLowerCase())
				}.bind(this))
			}
			this.resultats = resultats
		},
		filtrer (filtre) {
			let pads = this.pads
			if (this.requete !== '') {
				pads = this.resultats
			}
			switch (filtre) {
			case 'date-asc':
				pads.sort(function (a, b) {
					const dateA = new Date(a.date).getTime()
					const dateB = new Date(b.date).getTime()
					return dateA > dateB ? 1 : -1
				})
				break
			case 'date-desc':
				pads.sort(function (a, b) {
					const dateA = new Date(a.date).getTime()
					const dateB = new Date(b.date).getTime()
					return dateA < dateB ? 1 : -1
				})
				break
			case 'alpha-asc':
				pads.sort(function (a, b) {
					const a1 = a.titre.toLowerCase()
					const b1 = b.titre.toLowerCase()
					return a1 < b1 ? -1 : a1 > b1 ? 1 : 0
				})
				break
			case 'alpha-desc':
				pads.sort(function (a, b) {
					const a1 = a.titre.toLowerCase()
					const b1 = b.titre.toLowerCase()
					return a1 > b1 ? -1 : a1 < b1 ? 1 : 0
				})
				break
			}
			if (this.requete === '') {
				this.pads = pads
			} else {
				this.resultats = pads
			}
		},
		modifierFiltre (filtre) {
			if (this.filtre !== filtre) {
				this.chargement = true
				axios.post(this.hote + '/api/modifier-filtre', {
					identifiant: this.identifiant,
					filtre: filtre
				}).then(function (reponse) {
					this.chargement = false
					const donnees = reponse.data
					if (donnees === 'non_connecte') {
						this.$router.push('/')
					} else {
						this.filtrer(filtre)
						this.$store.dispatch('modifierFiltre', filtre)
						this.$store.dispatch('modifierMessage', this.$t('filtreModifie'))
					}
				}.bind(this)).catch(function () {
					this.chargement = false
					this.$store.dispatch('modifierAlerte', this.$t('erreurCommunicationServeur'))
				}.bind(this))
			}
		},
		modifierInformations () {
			const nom = document.querySelector('#nom').value.trim()
			const email = document.querySelector('#email').value.trim()
			if ((nom !== '' && nom !== this.nom) || (email !== '' && email !== this.email)) {
				if (email !== '' && this.$verifierEmail(email) === false) {
					this.$store.dispatch('modifierAlerte', this.$t('erreurEmail'))
					return false
				}
				this.menu = false
				this.chargement = true
				axios.post(this.hote + '/api/modifier-informations', {
					identifiant: this.identifiant,
					nom: nom,
					email: email
				}).then(function (reponse) {
					this.chargement = false
					const donnees = reponse.data
					if (donnees === 'non_connecte') {
						this.$router.push('/')
					} else {
						this.$store.dispatch('modifierInformations', { nom: nom, email: email })
						this.$store.dispatch('modifierMessage', this.$t('informationsModifiees'))
					}
				}.bind(this)).catch(function () {
					this.chargement = false
					this.$store.dispatch('modifierAlerte', this.$t('erreurCommunicationServeur'))
				}.bind(this))
			}
		},
		afficherModaleMotDePasse () {
			this.menu = false
			this.modaleMotDePasse = true
		},
		modifierMotDePasse () {
			const motDePasse = this.motDePasse
			const nouveauMotDePasse = this.nouveauMotDePasse.trim()
			const confirmationNouveauMotDePasse = this.confirmationNouveauMotDePasse.trim()
			if (nouveauMotDePasse === confirmationNouveauMotDePasse && nouveauMotDePasse !== '') {
				this.modaleMotDePasse = false
				this.chargement = true
				axios.post(this.hote + '/api/modifier-mot-de-passe', {
					identifiant: this.identifiant,
					motdepasse: motDePasse,
					nouveaumotdepasse: nouveauMotDePasse
				}).then(function (reponse) {
					this.chargement = false
					const donnees = reponse.data
					if (donnees === 'non_connecte') {
						this.$router.push('/')
					} else if (donnees === 'motdepasse_incorrect') {
						this.$store.dispatch('modifierAlerte', this.$t('motDePasseActuelPasCorrect'))
					} else if (donnees === 'erreur') {
						this.$store.dispatch('modifierAlerte', this.$t('erreurCommunicationServeur'))
					} else {
						this.$store.dispatch('modifierMessage', this.$t('motDePasseModifie'))
					}
					this.fermerModaleMotDePasse()
				}.bind(this)).catch(function () {
					this.chargement = false
					this.fermerModaleMotDePasse()
					this.$store.dispatch('modifierAlerte', this.$t('erreurCommunicationServeur'))
				}.bind(this))
			} else if (nouveauMotDePasse !== confirmationNouveauMotDePasse) {
				this.$store.dispatch('modifierAlerte', this.$t('nouveauxMotsDePasseCorrespondentPas'))
			}
		},
		fermerModaleMotDePasse () {
			this.modaleMotDePasse = false
			this.motDePasse = ''
			this.nouveauMotDePasse = ''
			this.confirmationNouveauMotDePasse = ''
		},
		modifierLangue (langue) {
			if (this.langue !== langue) {
				axios.post(this.hote + '/api/modifier-langue', {
					identifiant: this.identifiant,
					langue: langue
				}).then(function (reponse) {
					const donnees = reponse.data
					if (donnees === 'non_connecte') {
						this.$router.push('/')
					} else {
						this.$i18n.setLocale(langue)
						document.getElementsByTagName('html')[0].setAttribute('lang', langue)
						this.$store.dispatch('modifierLangue', langue)
						this.$store.dispatch('modifierMessage', this.$t('langueModifiee'))
					}
				}.bind(this)).catch(function () {
					this.$store.dispatch('modifierAlerte', this.$t('erreurCommunicationServeur'))
				}.bind(this))
			}
		},
		modifierAffichage (affichage) {
			if (this.affichage !== affichage) {
				this.chargement = true
				axios.post(this.hote + '/api/modifier-affichage', {
					identifiant: this.identifiant,
					affichage: affichage
				}).then(function (reponse) {
					this.chargement = false
					const donnees = reponse.data
					if (donnees === 'non_connecte') {
						this.$router.push('/')
					} else {
						this.$store.dispatch('modifierAffichage', affichage)
						this.$store.dispatch('modifierMessage', this.$t('affichageModifie'))
					}
				}.bind(this)).catch(function () {
					this.chargement = false
					this.$store.dispatch('modifierAlerte', this.$t('erreurCommunicationServeur'))
				}.bind(this))
			}
		},
		afficherModaleAjouterDossier () {
			this.modaleAjouterDossier = true
			this.$nextTick(function () {
				document.querySelector('#ajout-dossier input').focus()
			})
		},
		ajouterDossier () {
			if (this.dossier !== '') {
				this.modaleAjouterDossier = false
				this.chargement = true
				axios.post(this.hote + '/api/ajouter-dossier', {
					dossier: this.dossier,
					identifiant: this.identifiant
				}).then(function (reponse) {
					this.chargement = false
					const donnees = reponse.data
					if (donnees === 'non_connecte') {
						this.$router.push('/')
					} else if (donnees === 'erreur_ajout_dossier') {
						this.$store.dispatch('modifierAlerte', this.$t('erreurAjoutDossier'))
					} else {
						this.dossiers.push(donnees)
						this.$store.dispatch('modifierMessage', this.$t('dossierAjoute'))
					}
					this.dossier = ''
				}.bind(this)).catch(function () {
					this.chargement = false
					this.dossier = ''
					this.$store.dispatch('modifierAlerte', this.$t('erreurCommunicationServeur'))
				}.bind(this))
			}
		},
		fermerModaleAjouterDossier () {
			this.modaleAjouterDossier = false
			this.dossier = ''
		},
		afficherModaleModifierDossier (event, id) {
			event.preventDefault()
			event.stopPropagation()
			this.dossiers.forEach(function (dossier) {
				if (dossier.id === id) {
					this.dossier = dossier.nom
				}
			}.bind(this))
			this.dossierId = id
			this.modaleModifierDossier = true
			this.$nextTick(function () {
				document.querySelector('#modification-dossier input').focus()
			})
		},
		modifierDossier () {
			if (this.dossier !== '') {
				this.modaleModifierDossier = false
				this.chargement = true
				axios.post(this.hote + '/api/modifier-dossier', {
					dossier: this.dossier,
					dossierId: this.dossierId,
					identifiant: this.identifiant
				}).then(function (reponse) {
					this.chargement = false
					const donnees = reponse.data
					if (donnees === 'non_connecte') {
						this.$router.push('/')
					} else if (donnees === 'erreur_modification_dossier') {
						this.$store.dispatch('modifierAlerte', this.$t('erreurModificationDossier'))
					} else {
						this.dossiers.forEach(function (dossier, index) {
							if (dossier.id === this.dossierId) {
								this.dossiers[index].nom = this.dossier
							}
						}.bind(this))
						this.$store.dispatch('modifierMessage', this.$t('dossierModifie'))
					}
					this.fermerModaleModifierDossier()
				}.bind(this)).catch(function () {
					this.chargement = false
					this.fermerModaleModifierDossier()
					this.$store.dispatch('modifierAlerte', this.$t('erreurCommunicationServeur'))
				}.bind(this))
			}
		},
		fermerModaleModifierDossier () {
			this.modaleModifierDossier = false
			this.dossier = ''
			this.dossierId = ''
		},
		supprimerDossier () {
			this.modaleConfirmation = ''
			this.chargement = true
			axios.post(this.hote + '/api/supprimer-dossier', {
				dossierId: this.dossierId,
				identifiant: this.identifiant
			}).then(function (reponse) {
				this.chargement = false
				const donnees = reponse.data
				if (donnees === 'non_connecte') {
					this.$router.push('/')
				} else if (donnees === 'erreur_suppression_dossier') {
					this.$store.dispatch('modifierAlerte', this.$t('erreurSuppressionDossier'))
				} else {
					this.dossiers.forEach(function (dossier, index) {
						if (dossier.id === this.dossierId) {
							this.dossiers.splice(index, 1)
						}
					}.bind(this))
					this.onglet = 'pads-crees'
					this.$store.dispatch('modifierMessage', this.$t('dossierSupprime'))
					this.dossierId = ''
				}
			}.bind(this)).catch(function () {
				this.chargement = false
				this.dossierId = ''
				this.$store.dispatch('modifierAlerte', this.$t('erreurCommunicationServeur'))
			}.bind(this))
		},
		supprimerCompte () {
			this.chargement = true
			const identifiant = this.identifiant
			axios.post(this.hote + '/api/supprimer-compte', {
				identifiant: identifiant,
				type: 'utilisateur'
			}).then(function (reponse) {
				this.chargement = false
				const donnees = reponse.data
				if (donnees === 'erreur') {
					this.$store.dispatch('modifierAlerte', this.$t('erreurCommunicationServeur'))
				} else {
					this.$socket.emit('deconnexion', identifiant)
					this.$store.dispatch('reinitialiser')
					this.$router.push('/')
				}
			}.bind(this)).catch(function () {
				this.chargement = false
				this.$store.dispatch('modifierAlerte', this.$t('erreurCommunicationServeur'))
			}.bind(this))
		},
		deconnexion () {
			const identifiant = this.identifiant
			axios.post(this.hote + '/api/deconnexion').then(function () {
				this.$socket.emit('deconnexion', identifiant)
				this.$store.dispatch('reinitialiser')
				this.$router.push('/')
			}.bind(this)).catch(function () {
				this.$store.dispatch('modifierAlerte', this.$t('erreurCommunicationServeur'))
			}.bind(this))
		}
	}
}
</script>

<style scoped>
#page {
	width: 100%;
	height: 100%;
	background: #f8fafc;
}

/* Header modernisé */
.dashboard-header {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	height: 4rem;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 2rem;
	background: white;
	border-bottom: 1px solid #e2e8f0;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
	z-index: 100;
}

.header-left {
	display: flex;
	align-items: center;
}

.logo-link {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	text-decoration: none;
	color: inherit;
}

.logo-icon {
	width: 32px;
	height: 32px;
}

.brand-text {
	font-size: 1.25rem;
	font-weight: 700;
	color: #0f172a;
}

.header-center {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.page-title {
	font-size: 1.25rem;
	font-weight: 600;
	color: #0f172a;
	margin: 0;
}

.welcome-text {
	font-size: 0.75rem;
	color: #64748b;
}

.header-right {
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

.header-right span {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 40px;
	height: 40px;
	border-radius: 8px;
	cursor: pointer;
	transition: all 0.2s;
	color: #64748b;
}

.header-right span:hover {
	background: #f1f5f9;
	color: #0f172a;
}

.header-right #deconnexion:hover {
	background: #fef2f2;
	color: #ef4444;
}

#boutons {
	display: flex;
	justify-content: center;
	flex-wrap: wrap;
	gap: 1rem;
	margin-bottom: 2rem;
	align-items: center;
}

#bouton-selectionner {
	display: inline-flex;
	justify-content: center;
	align-items: center;
	width: 44px;
	height: 44px;
	background: white;
	border: 2px solid #e2e8f0;
	border-radius: 0.75rem;
	cursor: pointer;
	transition: all 0.2s ease;
	color: #64748b;
}

#bouton-selectionner:hover {
	border-color: #00ced1;
	color: #00ced1;
	background: #f0fdfa;
}

#bouton-selectionner.actif {
	background: #00ced1;
	border-color: #00ced1;
	color: white;
}

#bouton-selectionner i {
	font-size: 1.25rem;
}

#bouton-importer,
#bouton-creer {
	display: inline-flex;
	justify-content: center;
	align-items: center;
	min-width: 180px;
	line-height: 1;
	font-size: 0.875rem;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.025em;
	padding: 0.875rem 1.5rem;
	border: none;
	border-radius: 0.75rem;
	cursor: pointer;
	transition: all 0.2s ease;
	text-align: center;
}

#bouton-creer {
	background: linear-gradient(135deg, #00ced1, #00a5a8);
	color: white;
	box-shadow: 0 4px 14px rgba(0, 206, 209, 0.35);
}

#bouton-creer:not(.desactive):hover {
	transform: translateY(-2px);
	box-shadow: 0 6px 20px rgba(0, 206, 209, 0.45);
}

#bouton-importer {
	background: white;
	color: #0f172a;
	border: 2px solid #e2e8f0;
}

#bouton-importer:not(.desactive):hover {
	border-color: #00ced1;
	background: #f0fdfa;
}

#bouton-importer.desactive,
#bouton-creer.desactive {
	background: #e2e8f0;
	color: #94a3b8;
	box-shadow: none;
	cursor: default;
}

#identifiant {
	background: #f1f5f9;
}

.menu .bouton-rouge,
.menu .bouton-bleu {
	margin-top: 3rem;
}

.menu .bouton-rouge {
	margin-bottom: 3rem;
}

/* Sidebar modernisée */
#onglets {
	position: fixed;
	top: 4rem;
	left: 0;
	height: calc(100% - 4rem);
	width: 16rem;
	padding: 1.5rem 1rem;
	background: white;
	border-right: 1px solid #e2e8f0;
	overflow: auto;
	-webkit-overflow-scrolling: touch;
}

.sidebar-section {
	margin-bottom: 1.5rem;
}

.section-title {
	display: block;
	font-size: 0.7rem;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.05em;
	color: #94a3b8;
	padding: 0 0.75rem;
	margin-bottom: 0.5rem;
}

#onglets .onglet {
	position: relative;
	display: flex;
	align-items: center;
	gap: 0.75rem;
	text-align: left;
	padding: 0.625rem 0.75rem;
	margin-bottom: 0.25rem;
	font-size: 0.875rem;
	border-radius: 0.5rem;
	cursor: pointer;
	transition: all 0.15s ease;
	color: #475569;
}

#onglets .onglet:hover {
	background: #f1f5f9;
	color: #0f172a;
}

#onglets .onglet.actif {
	background: linear-gradient(135deg, rgba(0, 206, 209, 0.15), rgba(0, 165, 168, 0.1));
	color: #0891b2;
	font-weight: 600;
}

#onglets .onglet .tab-icon {
	font-size: 1.125rem;
	opacity: 0.7;
}

#onglets .onglet.actif .tab-icon {
	opacity: 1;
}

#onglets .onglet .tab-label {
	flex: 1;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

#onglets .bouton-ajouter {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	width: 100%;
	font-weight: 600;
	font-size: 0.75rem;
	text-transform: uppercase;
	letter-spacing: 0.025em;
	padding: 0.75rem 1rem;
	cursor: pointer;
	color: #64748b;
	background: #f8fafc;
	border: 2px dashed #e2e8f0;
	border-radius: 0.5rem;
	transition: all 0.2s ease;
	margin-top: 1rem;
}

#onglets .bouton-ajouter:hover {
	color: #0891b2;
	background: #f0fdfa;
	border-color: #0891b2;
}

#onglets .bouton-ajouter i {
	font-size: 1rem;
}

#onglets .onglet .menu-dossier {
	visibility: hidden;
	position: absolute;
	color: #fff;
	top: 50%;
	right: 0.5rem;
	transform: translateY(-50%);
	line-height: 1;
	font-size: 18px;
	padding: 0.25rem 0.5rem;
	background: rgba(0, 0, 0, 0.6);
	border-radius: 4px;
	opacity: 0;
	transition: opacity 0.2s ease;
}

#onglets .onglet:hover .menu-dossier {
	visibility: visible;
	opacity: 1;
}

#onglets .onglet .menu-dossier span.supprimer {
	color: #ff6259;
	cursor: pointer;
}

#onglets .onglet .menu-dossier span + span {
	margin-left: 0.5rem;
}

#onglets .onglet .badge {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 1.375rem;
	height: 1.375rem;
	padding: 0 0.375rem;
	background: #f1f5f9;
	border-radius: 0.375rem;
	font-size: 0.7rem;
	font-weight: 600;
	color: #64748b;
}

#onglets .onglet.actif .badge {
	background: rgba(0, 206, 209, 0.2);
	color: #0891b2;
}

#onglets .onglet.onglet-classroom {
	color: #1967D2;
	background: rgba(25, 103, 210, 0.08);
}

#onglets .onglet.onglet-classroom:hover {
	background: rgba(25, 103, 210, 0.12);
}

#onglets .onglet.onglet-classroom.actif {
	background: rgba(25, 103, 210, 0.15);
	font-weight: 600;
}

#onglets .onglet.onglet-classroom .tab-icon-svg {
	flex-shrink: 0;
	opacity: 0.85;
}

/* Sections principales */
#google-classroom-section {
	position: fixed;
	top: 4rem;
	left: 16rem;
	padding: 2rem;
	height: calc(100% - 4rem);
	width: calc(100% - 16rem);
	overflow: auto;
	-webkit-overflow-scrolling: touch;
	background: #f8fafc;
}

#pads {
	position: fixed;
	top: 4rem;
	left: 16rem;
	padding: 2rem;
	height: calc(100% - 4rem);
	width: calc(100% - 16rem);
	overflow: auto;
	-webkit-overflow-scrolling: touch;
	background: #f8fafc;
}

#pads.liste {
	padding: 2rem;
}

#pads.mosaique {
	padding: 2rem 1rem;
}

.vide {
	text-align: center;
	font-size: 1rem;
	padding: 3rem 2rem;
	background: white;
	border: 2px dashed #e2e8f0;
	border-radius: 1rem;
	color: #64748b;
	margin: 0 0 2rem;
}

/* Filtres modernisés */
#filtrer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 1.5rem;
	width: 100%;
	gap: 1rem;
	flex-wrap: wrap;
}

.mosaique #actions-dossier,
.mosaique #filtrer {
	padding: 0;
}

#filtrer .rechercher,
#filtrer .filtrer {
	display: flex;
	align-items: center;
	flex: 1;
	min-width: 200px;
	max-width: 300px;
}

#filtrer .afficher span,
#filtrer .filtrer span,
#filtrer .rechercher span {
	font-size: 20px;
	margin-right: 0.75rem;
	color: #64748b;
}

#filtrer .filtrer select,
#filtrer .rechercher input {
	flex: 1;
}

#filtrer select,
#filtrer input[type="search"] {
	font-size: 0.875rem;
	border: 1px solid #e2e8f0;
	border-radius: 0.5rem;
	padding: 0.625rem 1rem;
	text-align: left;
	background: white;
	transition: all 0.2s;
}

#filtrer select:focus,
#filtrer input[type="search"]:focus {
	outline: none;
	border-color: #00ced1;
	box-shadow: 0 0 0 3px rgba(0, 206, 209, 0.1);
}

#filtrer select {
	background: white url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="14" viewBox="0 0 29 14" width="29"><path fill="%2364748b" d="M9.37727 3.625l5.08154 6.93523L19.54036 3.625" /></svg>') center right 10px no-repeat;
	padding-right: 2.5rem;
	cursor: pointer;
}

#filtrer .afficher {
	display: flex;
	gap: 0.25rem;
	background: white;
	padding: 0.25rem;
	border-radius: 0.5rem;
	border: 1px solid #e2e8f0;
}

#filtrer .afficher span {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 36px;
	height: 36px;
	margin: 0;
	border-radius: 0.375rem;
	cursor: pointer;
	transition: all 0.15s;
}

#filtrer .afficher span:hover {
	background: #f1f5f9;
	color: #0f172a;
}

#actions-dossier {
	display: flex;
	justify-content: flex-end;
	align-items: center;
	font-size: 16px;
	margin-bottom: 3rem;
}

#actions-dossier .conteneur {
	display: flex;
	justify-content: flex-start;
	align-items: center;
	padding: 3px 1rem;
	background: rgba(0, 0, 0, 0.25);
	border-radius: 4px;
}

#actions-dossier span {
	color: #fff;
	font-size: 24px;
	margin-left: 1.5rem;
	cursor: pointer;
}

#actions-dossier span.supprimer {
	color: #ff6259;
	cursor: pointer;
}

/* Cartes de pads modernisées */
.pads {
	margin-bottom: 2rem;
}

.mosaique .pads {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	gap: 1.5rem;
}

.pad.liste {
	background: white;
	border: 1px solid #e2e8f0;
	border-radius: 0.75rem;
	padding: 1rem 1.25rem;
	margin-bottom: 0.75rem;
	display: flex;
	align-items: center;
	transition: all 0.2s;
}

.pad.liste:hover {
	border-color: #cbd5e1;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.pad.liste .fond {
	width: 3.5rem;
	height: 3.5rem;
	line-height: 3.5rem;
	border-radius: 0.5rem;
	background-size: cover;
	background-position: center;
	background-repeat: no-repeat;
	margin-right: 1rem;
	flex-shrink: 0;
}

.pad.liste .meta {
	flex: 1;
	min-width: 0;
}

.pad.liste .meta.pad-rejoint {
	flex: 1;
}

.pad.liste .meta.deplacer {
	flex: 1;
}

.pad.liste .meta.pad-rejoint.deplacer {
	flex: 1;
}

.pad.liste .titre {
	font-size: 1rem;
	font-weight: 600;
	color: #0f172a;
	display: block;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.pad.liste .vues,
.pad.liste .auteur,
.pad.liste .date {
	font-size: 0.75rem;
	color: #64748b;
}

.google-classroom-badges {
	display: inline-flex;
	flex-wrap: wrap;
	gap: 0.25rem;
	margin-left: 0.5rem;
}

.google-classroom-badge {
	display: inline-flex;
	align-items: center;
	gap: 0.25rem;
	padding: 0.2rem 0.6rem;
	color: white;
	border-radius: 1rem;
	font-size: 0.75rem;
	font-weight: 500;
	white-space: nowrap;
}

.google-classroom-badge i.material-icons {
	font-size: 0.875rem;
}

.pad.mosaique .google-classroom-badges {
	margin-left: 0;
	margin-top: 0.25rem;
}

.pad.liste .actions {
	display: flex;
	align-items: center;
	gap: 0.25rem;
	margin-left: auto;
	padding-left: 0.5rem;
}

.pad.liste .actions span {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	font-size: 18px;
	color: #64748b;
	cursor: pointer;
	border-radius: 0.375rem;
	transition: all 0.15s;
}

.pad.liste .actions span:hover {
	background: #f1f5f9;
	color: #0f172a;
}

.pad.mosaique .actions span.supprimer-favori,
.pad.liste .actions span.supprimer-favori {
	color: #fbbf24;
}

.pad.mosaique .actions span.deplacer.actif,
.pad.liste .actions span.deplacer.actif {
	color: #ec4899;
}

.conteneur-pads {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	gap: 1.5rem;
}

.pad.mosaique {
	position: relative;
	background: white;
	border: 1px solid #e2e8f0;
	border-radius: 1rem;
	overflow: hidden;
	transition: all 0.2s;
}

.pad.mosaique:hover {
	border-color: #cbd5e1;
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
	transform: translateY(-2px);
}

.pad.mosaique .conteneur {
	display: flex;
	justify-content: center;
	align-items: flex-end;
	padding: 0;
	width: 100%;
	height: 10rem;
	cursor: pointer;
}

.pad.mosaique .conteneur.fond-personnalise {
	background-size: cover;
	background-repeat: no-repeat;
	background-position: center;
}

.pad.mosaique .meta {
	width: 100%;
	padding: 1rem;
	background: linear-gradient(to top, rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.4));
	text-align: left;
}

.pad.mosaique .titre {
	display: block;
	color: #fff;
	font-size: 1rem;
	line-height: 1.4;
	font-weight: 600;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.pad.mosaique .vues,
.pad.mosaique .auteur,
.pad.mosaique .date {
	margin-top: 0.25rem;
	color: rgba(255, 255, 255, 0.75);
	font-size: 0.7rem;
	display: inline-block;
}

.pad.mosaique .actions {
	display: flex;
	justify-content: space-around;
	align-items: center;
	padding: 0.75rem;
	background: white;
	border-top: 1px solid #f1f5f9;
}

.pad.mosaique .actions span {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	color: #64748b;
	cursor: pointer;
	border-radius: 0.375rem;
	font-size: 18px;
	transition: all 0.15s;
}

.pad.mosaique .actions span:hover {
	background: #f1f5f9;
	color: #0f172a;
}

.pad.liste .actions .supprimer:hover,
.pad.mosaique .actions .supprimer:hover {
	color: #ef4444;
	background: #fef2f2;
}

.pad.liste .actions .admin,
.pad.mosaique .actions .admin {
	color: #0891b2;
}

.pad .mise-a-jour {
	width: 0.5rem;
	height: 0.5rem;
	display: inline-block;
	border-radius: 50%;
	background: #ec4899;
	margin-right: 0.25rem;
}

.pad.mosaique .mise-a-jour {
	margin-right: 0.25rem;
}

#import label:not(.bouton-interrupteur) {
	width: 100%;
	text-align: center;
	margin-top: 10px;
}

.progression .chargement {
	border-top: 0.7rem solid #00ced1;
	margin-top: 1rem;
}

.modale .conteneur-interrupteur {
	display: flex;
	justify-content: space-between;
	margin-bottom: 1rem;
	line-height: 2.2rem;
}

.modale .conteneur-interrupteur > span {
	font-size: 16px;
}

.modale .bouton-interrupteur {
	position: relative;
	display: inline-block!important;
	width: 3.8rem!important;
	height: 2.2rem;
	margin: 0;
}

.modale .bouton-interrupteur input {
	opacity: 0;
	width: 0;
	height: 0;
}

.modale .bouton-interrupteur .barre {
	position: absolute;
	cursor: pointer;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: #ccc;
	transition: 0.2s;
	border-radius: 3rem;
}

.modale .bouton-interrupteur .barre:before {
	position: absolute;
	content: '';
	height: 1.6rem;
	width: 1.6rem;
	left: 0.3rem;
	bottom: 0.3rem;
	background-color: #fff;
	transition: 0.2s;
	border-radius: 50%;
}

.modale .bouton-interrupteur input:checked + .barre {
	background-color: #00ced1;
}

.modale .bouton-interrupteur input:focus + .barre {
	box-shadow: 0 0 1px #00ced1;
}

.modale .bouton-interrupteur input:checked + .barre:before {
	transform: translateX(1.6rem);
}

/* Media queries modernisées */
@media screen and (max-width: 768px) {
	.dashboard-header {
		padding: 0 1rem;
	}

	.header-center {
		display: none;
	}

	#onglets {
		position: fixed;
		top: 4rem;
		left: 0;
		width: 100%;
		height: auto;
		max-height: 3.5rem;
		display: flex;
		flex-direction: row;
		align-items: center;
		padding: 0.5rem 1rem;
		overflow-x: auto;
		overflow-y: hidden;
		border-right: none;
		border-bottom: 1px solid #e2e8f0;
		gap: 0.5rem;
	}

	.sidebar-section {
		display: contents;
	}

	.section-title {
		display: none;
	}

	#onglets .onglet {
		flex-shrink: 0;
		padding: 0.5rem 0.75rem;
		margin-bottom: 0;
		border-radius: 2rem;
		background: #f1f5f9;
	}

	#onglets .onglet.actif {
		background: linear-gradient(135deg, #00ced1, #00a5a8);
		color: white;
	}

	#onglets .onglet .tab-icon {
		display: none;
	}

	#onglets .onglet .tab-label {
		font-size: 0.75rem;
	}

	#onglets .bouton-ajouter {
		flex-shrink: 0;
		padding: 0.5rem 0.75rem;
		margin: 0;
		font-size: 0.7rem;
		border-radius: 2rem;
		min-width: auto;
	}

	#onglets .bouton-ajouter i {
		display: none;
	}

	#onglets .onglet .menu-dossier {
		display: none !important;
	}

	#pads,
	#google-classroom-section {
		position: fixed;
		top: 7.5rem;
		left: 0;
		width: 100%;
		height: calc(100% - 7.5rem);
		padding: 1rem;
	}

	#filtrer {
		flex-direction: column;
		align-items: stretch;
	}

	#filtrer .rechercher,
	#filtrer .filtrer {
		max-width: none;
		width: 100%;
	}

	#filtrer .afficher {
		align-self: flex-end;
	}

	#boutons {
		flex-direction: column;
		align-items: stretch;
	}

	#bouton-importer,
	#bouton-creer {
		width: 100%;
		min-width: auto;
	}

	.pad.liste .actions {
		flex-wrap: wrap;
		justify-content: flex-end;
	}
}

@media screen and (min-width: 769px) and (max-width: 1023px) {
	#onglets {
		width: 14rem;
	}

	#pads,
	#google-classroom-section {
		left: 14rem;
		width: calc(100% - 14rem);
	}
}

@media screen and (orientation: landscape) and (max-height: 479px) {
	#motdepasse {
		height: 90%;
	}
}

@media screen and (max-width: 575px) {
	.mosaique .pads {
		grid-template-columns: 1fr;
	}
}

/* Styles pour le mode sélection multiple */
.selection-toggle span {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 2.5rem;
	height: 2.5rem;
	border-radius: 0.5rem;
	cursor: pointer;
	transition: all 0.2s ease;
	color: #64748b;
}

.selection-toggle span:hover {
	background: #f1f5f9;
	color: #0891b2;
}

.selection-toggle span.actif {
	background: #0891b2;
	color: white;
}

/* Style des pads en mode sélection */
.pad.liste.selection-mode {
	cursor: pointer;
}

.pad.liste.selection-mode:hover {
	background: #f8fafc;
}

.pad.liste.selected {
	background: #e0f2fe;
	border-color: #0891b2;
}

.pad-checkbox {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0 1rem;
	flex-shrink: 0;
}

.pad-checkbox .checkbox {
	width: 1.5rem;
	height: 1.5rem;
	border: 2px solid #cbd5e1;
	border-radius: 0.375rem;
	display: flex;
	align-items: center;
	justify-content: center;
	background: white;
	transition: all 0.2s ease;
}

.pad-checkbox .checkbox:hover {
	border-color: #0891b2;
}

.pad-checkbox .checkbox.checked {
	background: #0891b2;
	border-color: #0891b2;
	color: white;
}

.pad-checkbox .checkbox i {
	font-size: 1rem;
}

/* Barre d'actions flottante */
.selection-action-bar {
	position: fixed;
	bottom: 2rem;
	left: 50%;
	transform: translateX(-50%);
	background: white;
	border-radius: 1rem;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
	padding: 0.75rem 1.5rem;
	display: flex;
	align-items: center;
	gap: 1.5rem;
	z-index: 200;
	animation: slideUp 0.3s ease;
}

@keyframes slideUp {
	from {
		opacity: 0;
		transform: translateX(-50%) translateY(1rem);
	}
	to {
		opacity: 1;
		transform: translateX(-50%) translateY(0);
	}
}

.selection-info .count {
	font-weight: 600;
	color: #0f172a;
	font-size: 0.9rem;
}

.selection-actions {
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

.action-btn {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.625rem 1rem;
	border: none;
	border-radius: 0.5rem;
	font-size: 0.875rem;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
}

.action-btn.select-all {
	background: #f1f5f9;
	color: #475569;
}

.action-btn.select-all:hover {
	background: #e2e8f0;
}

.action-btn.classroom {
	background: linear-gradient(135deg, #0891b2 0%, #22d3d8 100%);
	color: white;
}

.action-btn.classroom:hover {
	box-shadow: 0 4px 12px rgba(8, 145, 178, 0.3);
	transform: translateY(-1px);
}

.action-btn.cancel {
	background: transparent;
	color: #64748b;
}

.action-btn.cancel:hover {
	background: #fef2f2;
	color: #ef4444;
}

.action-btn i {
	font-size: 1.125rem;
}

.action-btn svg {
	flex-shrink: 0;
}

@media screen and (max-width: 768px) {
	.selection-action-bar {
		left: 1rem;
		right: 1rem;
		transform: none;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1rem;
	}

	.selection-actions {
		flex-wrap: wrap;
		justify-content: center;
	}

	.action-btn span {
		display: none;
	}

	.action-btn {
		padding: 0.625rem;
	}
}
</style>
