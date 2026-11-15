package br.com.jadespa.admin.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "assinaturas")
public class Assinatura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "plano_id", nullable = false)
    private Plano plano;

    @Column(name = "data_inicio", nullable = false)
    private LocalDateTime dataInicio;

    @Column(name = "data_fim")
    private LocalDateTime dataFim;

    @Column(nullable = false)
    private String status = "ATIVA";

    public Assinatura() {
    }

    @PrePersist
    public void antesDeSalvar() {
        if (dataInicio == null) {
            dataInicio = LocalDateTime.now();
        }

        if (status == null || status.isBlank()) {
            status = "ATIVA";
        }
    }

    public Long getId() {
        return id;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public Plano getPlano() {
        return plano;
    }

    public LocalDateTime getDataInicio() {
        return dataInicio;
    }

    public LocalDateTime getDataFim() {
        return dataFim;
    }

    public String getStatus() {
        return status;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

    public void setPlano(Plano plano) {
        this.plano = plano;
    }

    public void setDataInicio(LocalDateTime dataInicio) {
        this.dataInicio = dataInicio;
    }

    public void setDataFim(LocalDateTime dataFim) {
        this.dataFim = dataFim;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}