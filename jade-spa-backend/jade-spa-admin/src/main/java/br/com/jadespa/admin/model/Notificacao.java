package br.com.jadespa.admin.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notificacoes", indexes = {
    @Index(name = "idx_notificacoes_cliente_email", columnList = "cliente_email"),
    @Index(name = "idx_notificacoes_criada_em", columnList = "criada_em")
})
public class Notificacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cliente_email", nullable = false, length = 180)
    private String clienteEmail;

    @Column(nullable = false, length = 100)
    private String titulo;

    @Column(nullable = false, length = 1000)
    private String mensagem;

    @Column(nullable = false, length = 30)
    private String tipo;

    @Column(nullable = false)
    private boolean lida = false;

    @Column(name = "criada_em", nullable = false)
    private LocalDateTime criadaEm = LocalDateTime.now();

    public Notificacao() {}

    @PrePersist
    public void antesDeSalvar() {
        if (criadaEm == null) {
            criadaEm = LocalDateTime.now();
        }

        if (tipo == null || tipo.isBlank()) {
            tipo = "GERAL";
        }
    }

    public Long getId() {
        return id;
    }

    public String getClienteEmail() {
        return clienteEmail;
    }

    public String getTitulo() {
        return titulo;
    }

    public String getMensagem() {
        return mensagem;
    }

    public String getTipo() {
        return tipo;
    }

    public boolean isLida() {
        return lida;
    }

    public LocalDateTime getCriadaEm() {
        return criadaEm;
    }

    public void setClienteEmail(String clienteEmail) {
        this.clienteEmail = clienteEmail;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public void setMensagem(String mensagem) {
        this.mensagem = mensagem;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public void setLida(boolean lida) {
        this.lida = lida;
    }
}
