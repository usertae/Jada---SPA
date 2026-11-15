package br.com.jadespa.admin.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "solicitacoes_troca_plano")
public class SolicitacaoTrocaPlano {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "plano_id", nullable = false)
    private Plano plano;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal valor;

    @Column(nullable = false)
    private String status = "AGUARDANDO_COMPROVANTE";

    private String comprovante;

    @Column(name = "observacao_admin")
    private String observacaoAdmin;

    @Column(name = "data_solicitacao")
    private LocalDateTime dataSolicitacao;

    @Column(name = "data_analise")
    private LocalDateTime dataAnalise;

    public SolicitacaoTrocaPlano() {
    }

    @PrePersist
    public void antesDeSalvar() {
        if (dataSolicitacao == null) {
            dataSolicitacao = LocalDateTime.now();
        }

        if (status == null || status.isBlank()) {
            status = "AGUARDANDO_COMPROVANTE";
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

    public BigDecimal getValor() {
        return valor;
    }

    public String getStatus() {
        return status;
    }

    public String getComprovante() {
        return comprovante;
    }

    public String getObservacaoAdmin() {
        return observacaoAdmin;
    }

    public LocalDateTime getDataSolicitacao() {
        return dataSolicitacao;
    }

    public LocalDateTime getDataAnalise() {
        return dataAnalise;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

    public void setPlano(Plano plano) {
        this.plano = plano;
    }

    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setComprovante(String comprovante) {
        this.comprovante = comprovante;
    }

    public void setObservacaoAdmin(String observacaoAdmin) {
        this.observacaoAdmin = observacaoAdmin;
    }

    public void setDataSolicitacao(LocalDateTime dataSolicitacao) {
        this.dataSolicitacao = dataSolicitacao;
    }

    public void setDataAnalise(LocalDateTime dataAnalise) {
        this.dataAnalise = dataAnalise;
    }
}
