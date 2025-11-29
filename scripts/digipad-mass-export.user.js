// ==UserScript==
// @name         Digipad Mass Export
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Exporte automatiquement tous les pads Digipad un par un
// @author       ChaiPad
// @match        https://digipad.app/u/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Ajouter un bouton d'export en masse
    function addExportButton() {
        const header = document.querySelector('.dashboard-header') || document.querySelector('header');
        if (!header) {
            setTimeout(addExportButton, 1000);
            return;
        }

        // Vérifier si le bouton existe déjà
        if (document.querySelector('#mass-export-btn')) return;

        const btn = document.createElement('button');
        btn.id = 'mass-export-btn';
        btn.innerHTML = '📦 Exporter tous les pads (0/0)';
        btn.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 10000;
            padding: 12px 20px;
            background: linear-gradient(135deg, #00ced1, #00a5a8);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        `;
        btn.onclick = startMassExport;
        document.body.appendChild(btn);

        // Panneau de progression
        const panel = document.createElement('div');
        panel.id = 'export-panel';
        panel.style.cssText = `
            position: fixed;
            top: 60px;
            right: 10px;
            z-index: 10000;
            width: 350px;
            max-height: 400px;
            overflow-y: auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            padding: 15px;
            display: none;
            font-size: 13px;
        `;
        panel.innerHTML = '<h3 style="margin:0 0 10px 0;">Export en cours...</h3><div id="export-log"></div>';
        document.body.appendChild(panel);
    }

    // Récupérer tous les pads de la page
    function getAllPads() {
        const padElements = document.querySelectorAll('.pad, [class*="pad-item"], .carte');
        const pads = [];

        padElements.forEach(el => {
            const link = el.querySelector('a[href*="/p/"]');
            const title = el.querySelector('.titre, h3, .pad-title')?.textContent?.trim() || 'Sans titre';

            if (link) {
                const href = link.getAttribute('href');
                const match = href.match(/\/p\/([^\/]+)/);
                if (match) {
                    pads.push({
                        id: match[1],
                        title: title,
                        href: href
                    });
                }
            }
        });

        return pads;
    }

    // Log dans le panneau
    function log(message, type = 'info') {
        const logDiv = document.getElementById('export-log');
        if (logDiv) {
            const color = type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#64748b';
            logDiv.innerHTML += `<div style="color:${color};margin:4px 0;">${message}</div>`;
            logDiv.scrollTop = logDiv.scrollHeight;
        }
        console.log(`[Digipad Export] ${message}`);
    }

    // Télécharger un pad via l'API d'export
    async function exportPad(padId, padTitle) {
        return new Promise((resolve, reject) => {
            // Ouvrir la page du pad dans un iframe caché pour récupérer le token
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = `https://digipad.app/p/${padId}`;

            iframe.onload = async () => {
                try {
                    // Attendre un peu que la page charge
                    await new Promise(r => setTimeout(r, 2000));

                    // Essayer de trouver le bouton d'export ou déclencher l'export
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

                    // Chercher le lien d'export dans le menu
                    const exportBtn = iframeDoc.querySelector('[data-action="exporter"], .exporter, a[href*="exporter"]');

                    if (exportBtn) {
                        exportBtn.click();
                        await new Promise(r => setTimeout(r, 1000));
                    }

                    // Alternative : appeler directement l'API
                    const response = await fetch(`https://digipad.app/api/exporter-pad`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ padId: padId }),
                        credentials: 'include'
                    });

                    if (response.ok) {
                        const blob = await response.blob();
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${padTitle.replace(/[^a-z0-9]/gi, '_')}_${padId}.zip`;
                        a.click();
                        URL.revokeObjectURL(url);
                        resolve(true);
                    } else {
                        reject(new Error(`HTTP ${response.status}`));
                    }
                } catch (e) {
                    reject(e);
                } finally {
                    document.body.removeChild(iframe);
                }
            };

            iframe.onerror = () => {
                document.body.removeChild(iframe);
                reject(new Error('Iframe load failed'));
            };

            document.body.appendChild(iframe);

            // Timeout après 30 secondes
            setTimeout(() => {
                if (document.body.contains(iframe)) {
                    document.body.removeChild(iframe);
                    reject(new Error('Timeout'));
                }
            }, 30000);
        });
    }

    // Méthode alternative : ouvrir chaque pad et cliquer sur exporter
    async function exportPadManual(padId, padTitle, token) {
        return new Promise((resolve) => {
            // Créer un lien de téléchargement direct
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = `https://digipad.app/api/exporter-pad`;
            form.target = '_blank';

            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'padId';
            input.value = padId;
            form.appendChild(input);

            // Token si disponible
            if (token) {
                const tokenInput = document.createElement('input');
                tokenInput.type = 'hidden';
                tokenInput.name = 'token';
                tokenInput.value = token;
                form.appendChild(tokenInput);
            }

            document.body.appendChild(form);
            form.submit();
            document.body.removeChild(form);

            // Attendre un peu entre chaque export
            setTimeout(resolve, 2000);
        });
    }

    // Lancer l'export en masse
    async function startMassExport() {
        const btn = document.getElementById('mass-export-btn');
        const panel = document.getElementById('export-panel');

        // Récupérer les pads
        const pads = getAllPads();

        if (pads.length === 0) {
            alert('Aucun pad trouvé sur cette page. Assurez-vous d\'être sur votre tableau de bord avec les pads visibles.');
            return;
        }

        const confirmed = confirm(`${pads.length} pads trouvés. Lancer l'export ?\n\nLes fichiers .zip seront téléchargés dans votre dossier de téléchargements.\n\nAttention : cela peut prendre plusieurs minutes.`);

        if (!confirmed) return;

        panel.style.display = 'block';
        btn.disabled = true;

        log(`Début de l'export de ${pads.length} pads...`);

        let success = 0;
        let errors = 0;

        for (let i = 0; i < pads.length; i++) {
            const pad = pads[i];
            btn.innerHTML = `📦 Export ${i + 1}/${pads.length}`;

            log(`[${i + 1}/${pads.length}] ${pad.title}...`);

            try {
                // Méthode simple : fetch direct avec credentials
                const response = await fetch('https://digipad.app/api/exporter-pad', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: pad.id }),
                    credentials: 'include'
                });

                if (response.ok) {
                    const blob = await response.blob();

                    // Vérifier que c'est bien un zip
                    if (blob.size > 0) {
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `pad_${pad.title.replace(/[^a-z0-9àâäéèêëïîôùûüç]/gi, '_').substring(0, 50)}_${pad.id}.zip`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);

                        log(`✓ ${pad.title}`, 'success');
                        success++;
                    } else {
                        throw new Error('Fichier vide');
                    }
                } else {
                    throw new Error(`HTTP ${response.status}`);
                }
            } catch (e) {
                log(`✗ ${pad.title}: ${e.message}`, 'error');
                errors++;
            }

            // Pause entre les exports pour ne pas surcharger le serveur
            await new Promise(r => setTimeout(r, 1500));
        }

        log(`\n--- Terminé ---`);
        log(`✓ Succès: ${success}`, 'success');
        if (errors > 0) log(`✗ Erreurs: ${errors}`, 'error');

        btn.innerHTML = `📦 Terminé (${success}/${pads.length})`;
        btn.disabled = false;

        alert(`Export terminé !\n\n✓ ${success} pads exportés\n✗ ${errors} erreurs\n\nLes fichiers .zip sont dans votre dossier de téléchargements.`);
    }

    // Initialiser
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addExportButton);
    } else {
        addExportButton();
    }

    // Réinitialiser si navigation AJAX
    const observer = new MutationObserver(() => {
        if (!document.querySelector('#mass-export-btn')) {
            addExportButton();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

})();
