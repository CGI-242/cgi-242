# Page snapshot

```yaml
- generic [ref=e5]:
  - generic [ref=e6]:
    - generic [ref=e8]: CGI
    - heading "Connexion" [level=1] [ref=e9]
    - paragraph [ref=e10]: Accédez à votre assistant fiscal IA
  - generic [ref=e11]:
    - generic [ref=e13]:
      - generic [ref=e14]:
        - generic [ref=e15]: Email
        - textbox "Email" [ref=e16]:
          - /placeholder: votre@email.com
      - generic [ref=e17]:
        - generic [ref=e18]: Mot de passe
        - textbox "Mot de passe" [ref=e19]:
          - /placeholder: Votre mot de passe
      - generic [ref=e20]:
        - generic [ref=e21]:
          - checkbox "Se souvenir de moi" [ref=e22]
          - generic [ref=e23]: Se souvenir de moi
        - link "Mot de passe oublié ?" [ref=e24] [cursor=pointer]:
          - /url: /auth/forgot-password
      - button "Se connecter" [disabled] [ref=e25]
    - paragraph [ref=e26]:
      - text: Pas encore de compte ?
      - link "S'inscrire" [ref=e27] [cursor=pointer]:
        - /url: /auth/register
```