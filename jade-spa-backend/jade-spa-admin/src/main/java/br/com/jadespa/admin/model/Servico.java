package br.com.jadespa.admin.model;

import jakarta.persistence.*;

@Entity
@Table(name = "servicos")
public class Servico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    private String categoria;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Column(name = "duracao_minutos", nullable = false)
    private Integer duracaoMinutos;

    @Column(name = "sessoes_por_mes")
    private Integer sessoesPorMes;

    @Column(nullable = false)
    private Boolean ativo = true;

    public Servico() {}

    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getCategoria() { return categoria; }
    public String getDescricao() { return descricao; }
    public Integer getDuracaoMinutos() { return duracaoMinutos; }
    public Integer getSessoesPorMes() { return sessoesPorMes; }
    public Boolean getAtivo() { return ativo; }

    public void setNome(String nome) { this.nome = nome; }
    public void setCategoria(String categoria) { this.categoria = categoria; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public void setDuracaoMinutos(Integer duracaoMinutos) { this.duracaoMinutos = duracaoMinutos; }
    public void setSessoesPorMes(Integer sessoesPorMes) { this.sessoesPorMes = sessoesPorMes; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }
}