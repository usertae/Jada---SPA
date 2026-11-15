package br.com.jadespa.admin.repository;

import br.com.jadespa.admin.model.Agendamento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AgendamentoRepository
        extends JpaRepository<Agendamento, Long> {

    List<Agendamento> findAllByClienteEmailIgnoreCaseOrderByCriadoEmDesc(
        String clienteEmail
    );

    long countByTipoAndNomeItemAndDiaSemanaAndHorarioAndStatusNot(
        String tipo,
        String nomeItem,
        String diaSemana,
        String horario,
        String status
    );

    boolean existsByTipoAndClienteEmailAndNomeItemAndDataAndHorarioAndStatusNot(
        String tipo,
        String clienteEmail,
        String nomeItem,
        java.time.LocalDate data,
        String horario,
        String status
    );

    boolean existsByTipoAndClienteEmailAndNomeItemAndDiaSemanaAndHorarioAndStatusNot(
        String tipo,
        String clienteEmail,
        String nomeItem,
        String diaSemana,
        String horario,
        String status
    );
}
