#!/bin/bash
# Ripristina il tema classico (dark flat)
BACKUP="src/styles/themes/classic"
cp "$BACKUP/variables.css"          src/styles/variables.css
cp "$BACKUP/global.css"             src/styles/global.css
cp "$BACKUP/AppHeader.module.css"   src/components/AppHeader/AppHeader.module.css
cp "$BACKUP/AppFooter.module.css"   src/components/AppFooter/AppFooter.module.css
cp "$BACKUP/ConfirmDialog.module.css" src/components/ConfirmDialog/ConfirmDialog.module.css
cp "$BACKUP/LibraryModal.module.css"  src/components/LibraryModal/LibraryModal.module.css
cp "$BACKUP/Home.module.css"        src/routes/Home/Home.module.css
cp "$BACKUP/Scaletta.module.css"    src/routes/Scaletta/Scaletta.module.css
cp "$BACKUP/Impostazioni.module.css" src/routes/Impostazioni/Impostazioni.module.css
cp "$BACKUP/SongEditor.module.css"  src/routes/SongEditor/SongEditor.module.css
echo "✓ Tema classico ripristinato. Esegui pnpm build."
