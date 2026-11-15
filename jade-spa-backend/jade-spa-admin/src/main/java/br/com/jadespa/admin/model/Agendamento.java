
package br.com.jadespa.admin.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "agendamentos")
public class Agendamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String tipo; // TRATAMENTO ou AULA

    @Column(name = "cliente_nome", nullable = false)
    private String clienteNome;

    @Column(name = "cliente_email", nullable = false)
    private String clienteEmail;

    @Column(name = "nome_item", nullable = false)
    private String nomeItem;

    private String profissional;

    private LocalDate data;

    @Column(name = "dia_semana")
    private String diaSemana;

    @Column(nullable = false)
    private String horario;

    @Column(nullable = false)
    private String status = "Confirmado";

    @Column(name = "criado_em", nullable = false)
    private LocalDateTime criadoEm = LocalDateTime.now();

    public Agendamento() {
    }

    @PrePersist
    public void antesDeSalvar() {
        if (criadoEm == null) {
            criadoEm = LocalDateTime.now();
        }

        if (status == null || status.isBlank()) {
            status = "Confirmado";
        }
    }

    public Long getId() { return id; }
    public String getTipo() { return tipo; }
    public String getClienteNome() { return clienteNome; }
    public String getClienteEmail() { return clienteEmail; }
    public String getNomeItem() { return nomeItem; }
    public String getProfissional() { return profissional; }
    public LocalDate getData() { return data; }
    public String getDiaSemana() { return diaSemana; }
    public String getHorario() { return horario; }
    public String getStatus() { return status; }
    public LocalDateTime getCriadoEm() { return criadoEm; }

    public void setTipo(String tipo) { this.tipo = tipo; }
    public void setClienteNome(String clienteNome) { this.clienteNome = clienteNome; }
    public void setClienteEmail(String clienteEmail) { this.clienteEmail = clienteEmail; }
    public void setNomeItem(String nomeItem) { this.nomeItem = nomeItem; }
    public void setProfissional(String profissional) { this.profissional = profissional; }
    public void setData(LocalDate data) { this.data = data; }
    public void setDiaSemana(String diaSemana) { this.diaSemana = diaSemana; }
    public void setHorario(String horario) { this.horario = horario; }
    public void setStatus(String status) { this.status = status; }
}
