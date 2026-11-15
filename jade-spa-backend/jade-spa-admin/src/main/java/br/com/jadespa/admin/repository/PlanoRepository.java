package br.com.jadespa.admin.repository;

import br.com.jadespa.admin.model.Plano;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PlanoRepository extends JpaRepository<Plano, Long> {

    List<Plano> findByAtivoTrueOrderByValorAsc();

    Optional<Plano> findByNome(String nome);
}