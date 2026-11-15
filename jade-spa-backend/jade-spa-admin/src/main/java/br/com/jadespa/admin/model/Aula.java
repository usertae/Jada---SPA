package br.com.jadespa.admin.model;

import jakarta.persistence.*;
import java.time.DayOfWeek;
import java.time.LocalTime;

@Entity
@Table(name = "aulas")
public class Aula {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DayOfWeek diaSemana;

    @Column(name = "horario_inicio", nullable = false)
    private LocalTime horarioInicio;

    @Column(name = "horario_fim", nullable = false)
    private LocalTime horarioFim;

    @Column(nullable = false)
    private Integer vagas = 10;

    @Column(nullable = false)
    private Boolean ativo = true;

    public Aula() {}

    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getDescricao() { return descricao; }
    public DayOfWeek getDiaSemana() { return diaSemana; }
    public LocalTime getHorarioInicio() { return horarioInicio; }
    public LocalTime getHorarioFim() { return horarioFim; }
    public Integer getVagas() { return vagas; }
    public Boolean getAtivo() { return ativo; }

    public void setNome(String nome) { this.nome = nome; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public void setDiaSemana(DayOfWeek diaSemana) { this.diaSemana = diaSemana; }
    public void setHorarioInicio(LocalTime horarioInicio) { this.horarioInicio = horarioInicio; }
    public void setHorarioFim(LocalTime horarioFim) { this.horarioFim = horarioFim; }
    public void setVagas(Integer vagas) { this.vagas = vagas; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }
}